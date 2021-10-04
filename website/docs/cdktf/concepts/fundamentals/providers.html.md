---
layout: "docs"
page_title: "Providers"
sidebar_current: "cdktf"
description: "Providers allow Terraform to communicate with external APIs. Learn to define providers in a CDK for Terraform application."
---

# Providers

A [provider](https://www.terraform.io/docs/language/providers/index.html) is any external API that has a plugin for Terraform. Provider plugins like the [AWS provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
or the [cloud-init provider](https://registry.terraform.io/providers/hashicorp/cloudinit/latest/docs) act as a translation layer that allows Terraform to communicate with many different cloud providers, databases, and services.

![diagram: How Terraform uses plugins](images/terraform-plugin-overview.png)

CDK for Terraform allows you to import both local providers and providers from the [Terraform Registry](https://registry.terraform.io/). The import process extracts the provider's schema and converts it into classes that you can use in your CDKTF application. This allows you to define resources for that provider in your chosen programming language.

## Prebuilt Providers

We offer several popular providers as prebuilt packages. The [Terraform CDK Providers](https://github.com/terraform-cdk-providers) page has a complete list, but available providers include:

- [AWS Provider](https://github.com/terraform-cdk-providers/cdktf-provider-aws)
- [Google Provider](https://github.com/terraform-cdk-providers/cdktf-provider-google)
- [Azure Provider](https://github.com/terraform-cdk-providers/cdktf-provider-azurerm)
- [Kubernetes Provider](https://github.com/terraform-cdk-providers/cdktf-provider-kubernetes)
- [Docker Provider](https://github.com/terraform-cdk-providers/cdktf-provider-docker)
- [Github Provider](https://github.com/terraform-cdk-providers/cdktf-provider-github)
- [Null Provider](https://github.com/terraform-cdk-providers/cdktf-provider-null)

These are regularly published to NPM / PyPi, and you can treat them as you would any other dependency. For example, here is how to install the AWS provider in TypeScript / Node:

```
npm install @cdktf/provider-aws
```

## Import Providers

CDK for Terraform lets you import Terraform [providers](https://www.terraform.io/docs/providers/index.html) to your project.

For example, this TypeScript example project has a `main.ts` file that defines AWS resources:

```typescript
import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider, Instance } from "./.gen/providers/aws";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "us-east-1",
    });

    new Instance(this, "Hello", {
      ami: "ami-2757f631",
      instanceType: "t2.micro",
    });
  }
}

const app = new App();
new MyStack(app, "hello-terraform");
app.synth();
```

### Add Provider to `cdktf.json`

To use a new provider, first add it to the "terraformProviders" array in `cdktf.json`.
For example, this is how you could add [DNS Simple](https://www.terraform.io/docs/providers/dnsimple/index.html) provider:

```json
{
  "language": "typescript",
  "app": "npm run --silent compile && node main.js",
  "terraformProviders": ["aws@~> 2.0", "dnsimple"]
}
```

-> **Note**: -> **Note**: The [`cdktf.json` specification](/docs/cdktf/cli-reference/configuration.html) contains syntax requirements for specifying a provider version.

### Generate Classes

Go to the working directory and run `cdktf get` to create the appropriate TypeScript classes for the provider automatically.

```bash
cdktf get
⠋ downloading and generating providers...
```

```bash
Generated typescript constructs in the output directory: .gen
```

### Import Classes

Import and use the generated classes in your application. For example, here is how to import the `DnsimpleProvider` and `Record` resources from `./.gen/providers/dnsimple` and define them.

```typescript
import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider, Instance } from "./.gen/providers/aws";
import { DnsimpleProvider, Record } from "./.gen/providers/dnsimple";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "us-east-1",
    });

    const instance = new Instance(this, "Hello", {
      ami: "ami-2757f631",
      instanceType: "t2.micro",
    });

    new DnsimpleProvider(this, "dnsimple", {
      token: Token.asString(process.env.DNSIMPLE_TOKEN),
      account: Token.asString(process.env.DNSIMPLE_ACCOUNT),
    });

    new Record(this, "web-www", {
      domain: "example.com",
      name: "web",
      value: instance.publicIp,
      type: "A",
    });
  }
}

const app = new App();
new MyStack(app, "hello-terraform");
app.synth();
```

Here is what this code looks like after using the `synth` command to convert it into a JSON configuration file for Terraform:

```bash
cdktf synth --json
```

```json
{
  "//": {
    "metadata": {
      "version": "0.0.11-pre.8757404fa25b6e405f1a51eac11b96943ccb372e",
      "stackName": "vpc-example"
    }
  },
  "terraform": {
    "required_providers": {
      "aws": "~> 2.0",
      "dnsimple": "undefined"
    }
  },
  "provider": {
    "aws": [
      {
        "region": "us-east-1"
      }
    ],
    "dnsimple": [
      {
        "account": "hello@example.com",
        "token": "xxxxxxxxxx"
      }
    ]
  },
  "resource": {
    "aws_instance": {
      "vpcexample_Hello_279554CB": {
        "ami": "ami-2757f631",
        "instance_type": "t2.micro",
        "//": {
          "metadata": {
            "path": "vpc-example/Hello",
            "uniqueId": "vpcexample_Hello_279554CB",
            "stackTrace": [
              .....
            ]
          }
        }
      }
    },
    "dnsimple_record": {
      "vpcexample_webwww_477C7150": {
        "domain": "example.com",
        "name": "web",
        "type": "A",
        "value": "${aws_instance.vpcexample_Hello_279554CB.public_ip}",
        "//": {
          "metadata": {
            "path": "vpc-example/web-www",
            "uniqueId": "vpcexample_webwww_477C7150",
            "stackTrace": [
              .....
            ]
          }
        }
      }
    }
  }
}

```

## Provider Caching

Caching prevents CDK for Terraform from re-downloading providers between each CLI command. It is also useful when you need to remove the `cdktf.out` folder and re-synthesize your configuration. Finally, caching is necessary when you use multiple stacks within one application.

### Caching Directory

Using the `cdktf` cli commands sets the process env `TF_PLUGIN_CACHE_DIR` to `$HOME/.terraform.d/plugin-cache` if it is not already set to something else. See the Terraform documentation about [how to configure your plugin cache](https://www.terraform.io/docs/commands/cli-config.html#provider-plugin-cache) for more details.

To disable this behavior, set `CDKTF_DISABLE_PLUGIN_CACHE_ENV` to a non null value, like `CDKTF_DISABLE_PLUGIN_CACHE_ENV=1`. You may want to do this when a different cache directory is configured via a `.terraformrc` configuration file.

## Use a Local Provider

Terraform supports using local providers. Terraform has to find these providers to enable CDK for Terraform to generate the appropriate type bindings. You can achieve this in two ways:

- [Implied Local Mirrors](https://www.terraform.io/docs/cli/config/config-file.html#implied-local-mirror-directories)
- [Development Overrides](https://www.terraform.io/docs/cli/config/config-file.html#development-overrides-for-provider-developers)

Once configured properly, you can reference these providers in the `cdktf.json` config file the same way that you reference providers in the Terraform Registry.
