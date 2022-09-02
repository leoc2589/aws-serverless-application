import { Construct } from 'constructs';
import { BuildConfig } from '../config/build-config';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { DatabaseService } from './database-service';
import { BastionHostForward } from './bastion-host-forward';
import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaApi } from './lambda-api';

export class AppCdkStack extends Stack {

  readonly env: string
  readonly vpc: Vpc
  readonly databaseService: DatabaseService
  readonly bastionHostForward: BastionHostForward
  readonly lambdaApi: LambdaApi

  constructor(scope: Construct, id: string, props: StackProps, config: BuildConfig) {
    super(scope, id, props);

    this.env = config.environment;

    this.vpc = new Vpc(this, "VPC", {
      vpcName: this.setName("VPC"),
      ...config.vpcProps
    })

    this.databaseService = new DatabaseService(this, "DatabaseService",
      config.databaseServiceProps
    );

    this.bastionHostForward = new BastionHostForward(this, "BastionHostForward",
      config.bastionHostForwardProps
    );

    this.lambdaApi = new LambdaApi(this, "LambdaApi",
      config.lambdaApiProps
    );
  }

  private setName(name: string): string {
    return this.stackName + name;
  }
}