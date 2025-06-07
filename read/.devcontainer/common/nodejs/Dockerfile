ARG NODE_VERSION
FROM node:${NODE_VERSION} AS devcontainer

# Download Terraform and install
RUN apt-get update && apt-get install -y \
    curl unzip \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://releases.hashicorp.com/terraform/1.12.1/terraform_1.12.1_linux_amd64.zip -o terraform.zip \
    && unzip terraform.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform.zip


ARG INSTALL_DOCKER=false
RUN if [ "$INSTALL_DOCKER" = "true" ]; then \
    apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release; \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg; \
    echo "deb [signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null; \
    apt-get update && apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*; \
    fi

# Set up everything needed for vscode/extensions to work
RUN mkdir -p /home/node/.vscode-server/extensions \
        /home/node/.vscode-server-insiders/extensions \
    && chown -R node /home/node/.vscode-server \
        /home/node/.vscode-server-insiders

RUN apt-get update && apt-get install -y less \
    && git config --system core.editor "code --wait" \
    && git config --system core.pager "less"

ENTRYPOINT ["/bin/sh", "-c", "while sleep 60000; do :; done"]
