run:
	sudo bash -c 'while true; do ./app.sh -c ./conf.d/mysql_appx.json; date; sleep 1; done'

init:
	sudo ./init.d/init.sh ./init.d/init.yaml
	sudo ./schema.d/r001.p01/run.sh
