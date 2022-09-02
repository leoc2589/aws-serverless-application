# AWS Serverless Application

Create AWS Serverless Application Project with AWS TypeScript CDK.

The stack deploys the following specific resources:

* AWS VPC.
* AWS VPC-related resources.
* AWS Secret Manager's Secret (username and password), for the DB Cluster.
* AWS RDS Aurora (PostgreSQL-compatible) DB Cluster.
* AWS EC2.
* AWS API Gateway.
* AWS Lambda.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template