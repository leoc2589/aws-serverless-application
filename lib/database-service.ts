import { Duration } from "aws-cdk-lib";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Credentials, DatabaseClusterEngine, ParameterGroup, ServerlessCluster } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { AppCdkStack } from "./app-cdk-stack";
import { DatabaseServiceProps } from "../config/build-config";

export class DatabaseService extends Construct {

  readonly stackName: string
  readonly securityGroup: SecurityGroup
  readonly secret: Secret
  readonly serverlessCluster: ServerlessCluster
  readonly connectionString: string

  constructor(scope: AppCdkStack, id: string, props: DatabaseServiceProps) {
    super(scope, id);

    this.stackName = scope.stackName

    this.securityGroup = new SecurityGroup(this, `ServerlessClusterSecurityGroup`, {
      securityGroupName: this.setName(`ServerlessClusterSecurityGroup`),
      vpc: scope.vpc,
      allowAllOutbound: true,
    });

    this.secret = new Secret(this, `DBCredentialsSecret`, {
      secretName: this.setName(`DBCredentialsSecret`),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: props.username }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    });

    this.serverlessCluster = new ServerlessCluster(this, `ServerlessCluster`, {
      clusterIdentifier: this.setName(`ServerlessCluster`),
      engine: DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
      defaultDatabaseName: props.defaultDatabaseName,
      credentials: Credentials.fromSecret(this.secret),
      deletionProtection: false,
      backupRetention: Duration.days(props.backupRetention),
      scaling: { autoPause: Duration.seconds(props.autoPause) },
      vpc: scope.vpc,
      securityGroups: [this.securityGroup]
    });

    this.connectionString = `Host=${this.serverlessCluster.clusterEndpoint.hostname};
      Database=${this.secret.secretValueFromJson('dbname').unsafeUnwrap()};
      Username=${this.secret.secretValueFromJson('username').unsafeUnwrap()};
      Password=${this.secret.secretValueFromJson('password').unsafeUnwrap()};`;
  }

  private setName(name: string): string {
    return this.stackName + name;
  }
}