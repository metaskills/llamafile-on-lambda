FROM node:20 as llamafile-builder

RUN mkdir /opt/local && \
    cd /tmp && \
    git clone https://github.com/Mozilla-Ocho/llamafile.git && \
    cd llamafile && \
    git checkout 21a30bed && \
    make && \
    make install PREFIX=/opt/local

FROM public.ecr.aws/lambda/nodejs:20

# Create llamafile files
RUN mkdir -p /opt/llamafile
COPY ./tmp/llamafile/* /opt/llamafile
COPY src/command /opt/llamafile/

# Install packages to support llamafile and other required tools
RUN microdnf update && \
  microdnf install -y findutils gzip wget && \
  microdnf clean all
RUN wget -O /usr/bin/ape https://cosmo.zip/pub/cosmos/bin/ape-$(uname -m).elf && \
    chmod +x /usr/bin/ape

# Copy llamafile build.
COPY --from=llamafile-builder /opt/local /usr/local

# Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_INVOKE_MODE=response_stream
ENV AWS_LWA_ASYNC_INIT=true
ENV AWS_LWA_READINESS_CHECK_PATH=/health

COPY src/app.js \
     package.json \
     package-lock.json .

# Start llamafile and no-op handler.
ENTRYPOINT [ "node", "app.js" ]
