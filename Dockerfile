FROM node:20

# Create llamafile files
RUN mkdir -p /opt/llamafile
COPY ./tmp/llamafile/* /opt/llamafile
COPY src/command /opt/llamafile/

# Install packages to support llamafile and other required tools
RUN apt-get update && \
    apt-get install -y findutils gzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_INVOKE_MODE=response_stream
ENV AWS_LWA_ASYNC_INIT=true
ENV AWS_LWA_READINESS_CHECK_PATH=/health

RUN mkdir -p /var/task
WORKDIR "/var/task"

COPY src/app.js \
     package.json \
     package-lock.json ./

# Start llamafile and no-op handler.
CMD [ "node", "app.js" ]
