import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as fs from "fs";
import * as logs from "@aws-cdk/aws-logs";
import * as route53 from "@aws-cdk/aws-route53";
import * as certificatemanager from '@aws-cdk/aws-certificatemanager';
import * as iam from "@aws-cdk/aws-iam";

export function getCertificate(scope: cdk.Construct, id: string, tags: { [p: string]: string } | undefined, appName: string, certificateArn: string) {
    return certificatemanager.Certificate.fromCertificateArn(scope, `${id}-acm-${appName}-arn-look`, certificateArn) as certificatemanager.Certificate;
}

export function getHostedZone(scope: cdk.Construct, id: string, tags: { [p: string]: string } | undefined, hostedZoneId: string, zoneName: string) {
    return route53.HostedZone.fromHostedZoneAttributes(scope, `${id}-hosted-zone-look`, {
        hostedZoneId,
        zoneName
    }) as route53.PublicHostedZone;
}

type LambdaOptions = {
    context?: string,
    memorySize?: number,
    layers?: lambda.LayerVersion[],
    timeout?: cdk.Duration
    logRetention?: logs.RetentionDays
};

export function buildLambda(
    scope: cdk.Construct,
    lambdasRoot: string,
    name: string,
    environment: any,
    {
        context = "",
        memorySize = 128,
        layers = [],
        timeout = cdk.Duration.seconds(10),
        logRetention = logs.RetentionDays.ONE_MONTH
    }: LambdaOptions
) {
    let directories = getDirectories(lambdasRoot);
    directories = directories.filter((e: any) => e !== name).filter((e: any) => e !== 'utils'); // Escludi tutto tranne la lambda da caricare e utils
    return new lambda.Function(scope, `${name}Lambda${context}`, {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: `./${name}/bin/run.handler`,
        code: lambda.Code.fromAsset(lambdasRoot, {
            exclude: directories
        }),
        memorySize,
        timeout,
        environment,
        layers,
        logRetention
    })
}

export function buildWebPackLambda(
    scope: cdk.Construct,
    lambdasRoot: string,
    name: string, environment: any,
    {
        context = "",
        memorySize = 128,
        layers = [],
        timeout = cdk.Duration.seconds(10),
        logRetention = logs.RetentionDays.ONE_MONTH
    }: LambdaOptions
) {
    return new lambda.Function(scope, `${name}Lambda${context}`, {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: `index.handler`,
        code: lambda.Code.fromAsset(`${lambdasRoot}/${name}/build`),
        memorySize,
        timeout,
        environment,
        layers,
        logRetention
    });
}

export function buildLambdaLayer(scope: cdk.Construct, lambdasRoot: string, name: string) {
    let directories = getDirectories(lambdasRoot);
    directories = directories.filter(e => e !== name); // Escludi tutto tranne il layer da caricare
    return new lambda.LayerVersion(scope, `${name}LambdaLayer`, {
        compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
        code: lambda.Code.fromAsset(lambdasRoot, {
            exclude: directories
        }),
    })
}

export function addStatement(lambda: lambda.Function) {
    const statement = new iam.PolicyStatement();
    statement.addActions("logs:CreateLogGroup");
    statement.addActions("logs:CreateLogStream");
    statement.addActions("logs:PutLogEvents");
    statement.addActions("ec2:CreateNetworkInterface");
    statement.addActions("ec2:DescribeNetworkInterfaces");
    statement.addActions("ec2:DeleteNetworkInterface");
    statement.addActions("dynamodb:*");
    statement.addActions("s3:*");
    statement.addActions("lambda:InvokeFunction");
    statement.addActions("kinesis:PutRecords");
    statement.addResources("*");
    lambda.addToRolePolicy(statement);
    return lambda
}

function getDirectories(source: fs.PathLike) {
    return fs.readdirSync(source, {withFileTypes: true})
        .filter((dirent: any) => dirent.isDirectory())
        .map((dirent: any) => dirent.name)
}
