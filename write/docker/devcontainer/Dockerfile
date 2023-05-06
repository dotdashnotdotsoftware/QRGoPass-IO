FROM node:18.16.0 as devcontainer

RUN apt-get -yqq update && \
        apt-get -yqq install docker.io less gnupg software-properties-common curl
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
RUN apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
RUN apt-get -yqq update && apt-get -yqq install terraform

# Set up everything needed for vscode/extensions to work
RUN mkdir -p /home/node/.vscode-server/extensions \
        /home/node/.vscode-server-insiders/extensions \
    && chown -R node /home/node/.vscode-server \
        /home/node/.vscode-server-insiders

RUN git config --system core.editor "code --wait" && git config --system core.pager "less"

ENTRYPOINT ["/bin/sh", "-c", "while sleep 60000; do :; done"]