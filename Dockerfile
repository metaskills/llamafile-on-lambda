FROM public.ecr.aws/lambda/nodejs:20

# Create llamafile files
RUN mkdir -p /opt/llamafile
COPY ./tmp/llamafile/* /opt/llamafile
COPY src/command /opt/llamafile/

# Install packages to support llamafile
RUN microdnf update && \
  microdnf install -y findutils gzip && \
  microdnf clean all

# Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_INVOKE_MODE=response_stream
ENV AWS_LWA_ASYNC_INIT=true

COPY src/app.js .

# Start the llamafile with your handler
ENTRYPOINT [ "/opt/llamafile/command" ]
CMD [ "app.handler" ]
