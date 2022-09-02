import { Fn } from 'aws-cdk-lib';
import { CfnInstance, UserData } from 'aws-cdk-lib/aws-ec2';
import { BastionHostLinux, Peer, Port, SecurityGroup, SubnetType } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { AppCdkStack } from "./app-cdk-stack";
import { BastionHostForwardProps } from '../config/build-config';

export class BastionHostForward extends Construct {

  readonly stackName: string
  readonly securityGroup: SecurityGroup
  readonly bastionHost: BastionHostLinux

  constructor(scope: AppCdkStack, id: string, props: BastionHostForwardProps) {
    super(scope, id);

    this.stackName = scope.stackName

    this.securityGroup = new SecurityGroup(this, `BastionHostSecurityGroup`, {
      securityGroupName: this.setName(`BastionHostSecurityGroup`),
      vpc: scope.vpc,
      allowAllOutbound: true,
    });

    this.bastionHost = new BastionHostLinux(this, "BastionHost", {
      instanceName: this.setName(`BastionHost`),
      vpc: scope.vpc,
      securityGroup: this.securityGroup,
      subnetSelection: scope.vpc.selectSubnets({ subnetType: SubnetType.PUBLIC })
    })

    const cfnBastionHost = this.bastionHost.instance.node.defaultChild as CfnInstance;
    const shellCommands = this.generateEc2UserData(
      scope.databaseService.serverlessCluster.clusterEndpoint.hostname,
      `${scope.databaseService.serverlessCluster.clusterEndpoint.port}`,
      1);
    cfnBastionHost.userData = Fn.base64(shellCommands.render());

    scope.databaseService.securityGroup.connections.allowFrom(
      this.securityGroup,
      Port.tcp(scope.databaseService.serverlessCluster.clusterEndpoint.port));

    props.ingressRules.map(rule => {
      this.securityGroup.addIngressRule(
        Peer.ipv4(rule.address),
        Port.tcp(rule.port),
        `Allow POSTGRESQL access from ${rule.name}`);
      this.securityGroup.addIngressRule(
        Peer.ipv4(rule.address),
        Port.icmpPing(),
        `Allow ping access from ${rule.name}`)
    });
  }

  private setName(name: string): string {
    return this.stackName + name;
  }

  private generateEc2UserData(address: string, port: string, clientTimeout: number): UserData {
    return UserData.custom(
      `Content-Type: multipart/mixed; boundary="//"
MIME-Version: 1.0
--//
Content-Type: text/cloud-config; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="cloud-config.txt"
#cloud-config
cloud_final_modules:
- [scripts-user, always]
--//
Content-Type: text/x-shellscript; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="userdata.txt"
#!/bin/bash
mount -o remount,rw,nosuid,nodev,noexec,relatime,hidepid=2 /proc
yum install -y haproxy
echo "${this.generateHaProxyBaseConfig(address, port, clientTimeout)}" > /etc/haproxy/haproxy.cfg
service haproxy restart
--//`,
    )
  }

  private generateHaProxyBaseConfig(address: string, port: string, clientTimeout: number): string {
    return `listen database
bind 0.0.0.0:${port}
timeout connect 10s
timeout client ${clientTimeout}m
timeout server 1m
mode tcp
server service ${address}:${port}\n`;
  }
}