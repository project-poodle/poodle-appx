run:
	sudo bash -c 'while true; do ./app.sh -c ./conf.d/mysql_appx.json; date; sleep 1; done'

init:
	sudo ./init.d/init.sh ./init.d/init.yaml
	sudo ./schema.d/r001.p01/run.sh

test:
	http -a 'appx@LOCAL:P@@dle101' 'http://localhost:3000/api/sys/appx/base/namespace'
	echo '{"realm":"appx","username":"appx@LOCAL","password":"P@@dle101"}' | http POST 'http://localhost:3000/api/sys/appx/login'
