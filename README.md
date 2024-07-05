# WIP

Quick notes, currently using Gemma2 with llamafile.

* `./bin/build` <- To download  and build a llamafile container for deployment.
* `./bin/server` <- To run the llamafile server locally.
* `./bin/deploy` <- Deploy to AWS Lambda. Assumes AWS config and SAM installed.

Once a local server is running or you have deployed to Lambda, you can chat with llamafile using `npm run chat` after you have done a `npm install`. This uses Inquirer.js along with the OpenAI API to chat with the model. Default is localhost, but you can change the URL as the first prompt to the Lambda Function URL deployed.

<br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br>

# Llamafile on Lambda Demo

The llamafile project lets you distribute and run LLMs with a single file.

https://github.com/Mozilla-Ocho/llamafile



https://huggingface.co/microsoft/Phi-3-mini-4k-instruct

The Phi-3-Mini-4K-Instruct is a 3.8B parameters, lightweight, state-of-the-art open model trained with the Phi-3 datasets that includes both synthetic data and the filtered publicly available websites data with a focus on high-quality and reasoning dense properties.


BIG NEWS

https://x.com/JustineTunney/status/1808165898743878108
https://huggingface.co/jartine/gemma-2-9b-it-llamafile/tree/main



## Deploy

The following assumptions are made for the deploy environment:

1. An arm64 architecture. For example, a Mac with Apple Silicon.
2. A free [AWS account](https://aws.amazon.com/free) and configured credentials. Ex: `brew install awscli` and `aws configure`.
3. The [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) is installed. Ex: `brew install aws/tap/aws-sam-cli`
4. 

```shell
./bin/deploy
```

```
------------------------------------------------------------------------------------
Outputs
------------------------------------------------------------------------------------
Key            LambdaFunctionUrl
Description    Lambda Function URL
Value          https://rqtkljzqpunkbwcwm4iysxpg3m0oxyze.lambda-url.us-east-1.on.aws/
------------------------------------------------------------------------------------
```

## Findings

* 6 Threads with 6 vCPUs is 40% faster than 3 Threads.

## Hurdles

Random notes to myself on where things were tricky. First up, using Lambda Extension and dealing with slow (presumably > 10s init) issues. Assuming use with Lambda Web Adapter with Llamafile's server, ensure LWA is asnyc.

```dockerfile
ENV AWS_LWA_ASYNC_INIT=true
```

Finally able to get to the warming up the model step. Note the 10s timestamps. Perhaps the panicked is the init phase doing a timeout and hard shutdown.
