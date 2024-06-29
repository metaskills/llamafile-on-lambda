FROM public.ecr.aws/lambda/nodejs:20

# Create llamafile extension
RUN mkdir -p /opt/extensions/llamafile
COPY ./tmp/llamafile/* /opt/extensions/llamafile
COPY ext/llamafile.sh /opt/extensions/

# Install packages to support extension
RUN microdnf update && \
  microdnf install -y findutils gzip && \
  microdnf clean all

# Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_INVOKE_MODE=response_stream

# Start the Lambda function
CMD [ "sleep", "infinity" ]
