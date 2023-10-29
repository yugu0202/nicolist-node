FROM node:16

ENV LANG ja_JP.UTF-8

RUN apt update && apt -y upgrade

RUN apt install -y locales fonts-ipafont fonts-ipaexfont && echo "ja_JP UTF-8" > /etc/locale.gen && locale-gen

RUN apt install -y chromium

CMD ["node","index.js"]
