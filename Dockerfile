FROM node:latest

COPY treetagger usr/local/treetagger
WORKDIR /usr/local/treetagger
RUN sh install-tagger.sh

WORKDIR /
RUN mkdir /populator
WORKDIR /populator

COPY package.json /populator/
RUN npm install

COPY lib /populator/lib
COPY populator.js /populator
COPY stopwords.txt /populator
