FROM node:latest

RUN mkdir usr/local/treetagger
RUN curl -sSL http://www.cis.uni-muenchen.de/~schmid/tools/TreeTagger/data/tree-tagger-linux-3.2.1.tar.gz | tar xz -C usr/local/treetagger
RUN curl -sSL http://www.cis.uni-muenchen.de/~schmid/tools/TreeTagger/data/tagger-scripts.tar.gz | tar xz -C usr/local/treetagger
RUN curl -sSL http://www.cis.uni-muenchen.de/~schmid/tools/TreeTagger/data/install-tagger.sh -o usr/local/treetagger/install-tagger.sh
RUN curl -sSL http://www.cis.uni-muenchen.de/~schmid/tools/TreeTagger/data/german-par-linux-3.2-utf8.bin.gz -o usr/local/treetagger/german-par-linux-3.2-utf8.bin.gz
WORKDIR /usr/local/treetagger
RUN sh install-tagger.sh

WORKDIR /
RUN mkdir /populator
WORKDIR /populator

COPY package.json /populator/
RUN npm install

COPY . /populator
