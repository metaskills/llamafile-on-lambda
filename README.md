
# Llamafile on Lambda Demo (Phi-3 Mini 4k Instruct)

The llamafile project lets you distribute and run LLMs with a single file.

https://github.com/Mozilla-Ocho/llamafile



https://huggingface.co/microsoft/Phi-3-mini-4k-instruct

The Phi-3-Mini-4K-Instruct is a 3.8B parameters, lightweight, state-of-the-art open model trained with the Phi-3 datasets that includes both synthetic data and the filtered publicly available websites data with a focus on high-quality and reasoning dense properties.




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


## Hurdles

Random notes to myself on where things were tricky. First up, using Lambda Extension and dealing with slow (presumably > 10s init) issues. Assuming use with Lambda Web Adapter with Llamafile's server, ensure LWA is asnyc.

```dockerfile
ENV AWS_LWA_ASYNC_INIT=true
```

Finally able to get to the warming up the model step. Note the 10s timestamps. Perhaps the panicked is the init phase doing a timeout and hard shutdown.

```
2024-06-29T19:27:57.541Z	warming up the model with an empty run
2024-06-29T19:28:07.229Z	thread 'main' panicked at src/main.rs:25:25:
2024-06-29T19:28:07.229Z	lambda runtime failed: Error { kind: SendRequest, source: Some(hyper::Error(IncompleteMessage)) }
```

> [!IMPORTANT]  
> Going to move this out of an extension to see panic is > 10s init issue.



