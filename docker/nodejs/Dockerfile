FROM node:16-alpine3.11

RUN echo 'root:root' |chpasswd
RUN adduser -S app \
    && echo "app ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && echo 'app:app' | chpasswd \
    && npm init --yes

ENV HOME=/home/app

USER app
WORKDIR $HOME/opt