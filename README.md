
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

### Move Lambda Extension to ENTRYPOINT & arm64 to x86_64.

No more panic. Still not llamafile fully booted.

```
2024-06-30T03:34:30.035Z	Starting llamafile...
...
2024-06-30T03:34:30.440Z	warming up the model with an empty run
2024-06-30T03:34:39.877Z	EXTENSION Name: lambda-adapter State: Ready Events: []
2024-06-30T03:34:39.877Z	INIT_REPORT Init Duration: 10000.50 ms Phase: init Status: timeout
```

### Llamafile boot in app.js. No LWA.

```
{
    "function": "server_cli",
    "level": "INFO",
    "line": 2868,
    "msg": "system info",
    "n_threads": 3,
    "n_threads_batch": -1,
    "system_info": "AVX = 1 | AVX_VNNI = 0 | AVX2 = 1 | AVX512 = 0 | AVX512_VBMI = 0 | AVX512_VNNI = 0 | AVX512_BF16 = 0 | FMA = 1 | NEON = 0 | ARM_FMA = 0 | F16C = 1 | FP16_VA = 0 | WASM_SIMD = 0 | BLAS = 0 | SSE3 = 1 | SSSE3 = 1 | VSX = 0 | MATMUL_INT8 = 0 | LLAMAFILE = 1 | ",
    "tid": "10729696",
    "timestamp": 1719767334,
    "total_threads": 6
}
...
llama server listening at http://127.0.0.1:8080
In the sandboxing block!
warning: this OS doesn't support pledge() security
REPORT RequestId: 9466cbf4-3e91-4d95-948a-a29211c59ab4	Duration: 840969.07 ms	Billed Duration: 840970 ms	Memory Size: 10240 MB	Max Memory Used: 5986 MB
```

### arm64 Again

```
2024-06-30T17:55:47.008Z	Starting llamafile...
{
    "function": "server_cli",
    "level": "INFO",
    "line": 2868,
    "msg": "system info",
    "n_threads": 3,
    "n_threads_batch": -1,
    "system_info": "AVX = 0 | AVX_VNNI = 0 | AVX2 = 0 | AVX512 = 0 | AVX512_VBMI = 0 | AVX512_VNNI = 0 | AVX512_BF16 = 0 | FMA = 0 | NEON = 1 | ARM_FMA = 1 | F16C = 0 | FP16_VA = 0 | WASM_SIMD = 0 | BLAS = 0 | SSE3 = 0 | SSSE3 = 0 | VSX = 0 | MATMUL_INT8 = 0 | LLAMAFILE = 1 | ",
    "tid": "1099516325632",
    "timestamp": 1719770147,
    "total_threads": 6
}
...
2024-06-30T17:58:59.828Z	llama server listening at http://127.0.0.1:8080
2024-06-30T17:58:59.839Z	REPORT RequestId: 9e476a59-290a-4ad0-abd4-5fe1992e899f Duration: 183039.18 ms Billed Duration: 183040 ms Memory Size: 10240 MB Max Memory Used: 6265 MB
```

## Benchmarks

```sql

fields @message
| filter ispresent(@initDuration)
| limit 100


fields @initDuration
| filter ispresent(@initDuration)
| stats max(@initDuration) as max_init
  by bin(1h)
```

```sql
fields @timestamp, @initDuration, @logStream
| filter ispresent(@initDuration)
| stats pct(@initDuration, 5) as p5,
        pct(@initDuration, 50) as p50,
        pct(@initDuration, 95) as p95,
        pct(@initDuration, 99) as p99,
        max(@initDuration) as max_init,
        count(*) as cold_start_count
  by bin(15m), @logStream
| sort @timestamp asc
```
