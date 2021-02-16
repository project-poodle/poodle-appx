FROM node:14
WORKDIR /usr/src/poodle-appx
COPY . .
WORKDIR /usr/src/poodle-appx/app
RUN rm -fR conf.d log.d node_modules/
RUN npm install 
ENV mysql_host=poodle-mysql
ENV mysql_port=3306
ENV mysql_admin_user=root
ENV mysql_admin_pass=P@@dle101
WORKDIR /usr/src/poodle-appx/ui
RUN rm -fR node_modules/ dist/
RUN npm install
RUN npm run build
WORKDIR /usr/src/poodle-appx/app
EXPOSE 3000
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT [ "./docker-entrypoint.sh" ]
