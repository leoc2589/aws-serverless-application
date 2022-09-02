export interface BuildConfig {
  readonly awsAccountID: string
  readonly awsProfileName: string
  readonly awsProfileRegion: string
  readonly app: string
  readonly environment: string
  readonly version: string
  readonly build: string
  readonly vpcProps: { [key: string]: string }
  readonly databaseServiceProps: DatabaseServiceProps
  readonly bastionHostForwardProps: BastionHostForwardProps
  readonly lambdaApiProps: LambdaApiProps
}

export interface DatabaseServiceProps {
  readonly username: string
  readonly defaultDatabaseName: string
  readonly backupRetention: number
  readonly autoPause: number
}

export interface BastionHostForwardProps {
  readonly prova: string
  readonly ingressRules: IngressRule[]
}

export interface IngressRule {
  readonly address: string
  readonly port: number
  readonly name: string
}

export interface LambdaApiProps {
  readonly code: string
  readonly timeout: number
  readonly memorySize: number
  readonly policies: string[]
  readonly variables: { [key: string]: string }
}