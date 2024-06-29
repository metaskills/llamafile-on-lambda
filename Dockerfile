FROM public.ecr.aws/lambda/nodejs:20

# Create llamafile extension
RUN mkdir -p /opt/extensions/llamafile
COPY ./tmp/llamafile/* /opt/extensions/llamafile
COPY llamafile.sh /opt/extensions/

# Set LAMBDA_TASK_ROOT
ENV LAMBDA_TASK_ROOT=/app
WORKDIR $LAMBDA_TASK_ROOT

# Install findutils package which includes the find command
RUN microdnf update && \
    microdnf install -y findutils && \
    microdnf clean all

# Copy the handler
COPY app.js ${LAMBDA_TASK_ROOT}

# Start the Lambda function
CMD [ "app.handler" ]
