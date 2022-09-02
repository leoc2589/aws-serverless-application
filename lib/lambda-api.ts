import { Duration } from "aws-cdk-lib";
import { LambdaIntegration, MethodLoggingLevel, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { DockerImageCode, DockerImageFunction, Tracing } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs"
import { LambdaApiProps } from "../config/build-config";
import { AppCdkStack } from "./app-cdk-stack";

export class LambdaApi extends Construct {

  readonly stackName: string
  readonly securityGroup: SecurityGroup
  readonly role: Role
  readonly function: DockerImageFunction
  readonly restApi: RestApi

  constructor(scope: AppCdkStack, id: string, props: LambdaApiProps) {
    super(scope, id);

    this.stackName = scope.stackName;

    this.securityGroup = new SecurityGroup(this, `LambdaApiSecurityGroup`, {
      securityGroupName: this.setName(`LambdaApiSecurityGroup`),
      vpc: scope.vpc,
      allowAllOutbound: true,
    });

    this.role = new Role(this, `LambdaApiServiceRole`, {
      roleName: this.setName(`LambdaApiServiceRole`),
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: props.policies.map(
        policyName => ManagedPolicy.fromAwsManagedPolicyName(policyName))
    })

    this.function = new DockerImageFunction(this, 'LambdaApiFunction', {
      functionName: this.setName(`LambdaApiFunction`),
      code: DockerImageCode.fromImageAsset(props.code),
      timeout: Duration.seconds(props.timeout),
      memorySize: props.memorySize,
      environment: {
        "env": scope.env,
        "region": scope.region,
        "connectionString": scope.databaseService.connectionString,
        ...props.variables
      },
      vpc: scope.vpc,
      role: this.role,
      securityGroups: [this.securityGroup],
      tracing: Tracing.ACTIVE
    })

    scope.databaseService.securityGroup.connections.allowFrom(
      this.securityGroup,
      Port.tcp(scope.databaseService.serverlessCluster.clusterEndpoint.port));

    this.restApi = new RestApi(this, `RestApi`, {
      restApiName: this.setName(`RestApi`),
      deployOptions: {
        stageName: scope.env,
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      }
    });

    this.restApi.root.addProxy({
      defaultIntegration: new LambdaIntegration(this.function)
    });
  }

  private setName(name: string): string {
    return this.stackName + name;
  }
}