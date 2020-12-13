run:
	while true; do ./app.sh -c ./conf.d/mysql_appx.json -m ./conf.d/mount_appx.json; date; sleep 1; done

build:
	npm install

init:
	./init.d/init.sh ./init.d/init.yaml
	./schema.d/r001.p01/run.sh

test:
	echo '{"realm":"appx","username":"appx@LOCAL","password":"P@@dle101"}' | http POST 'http://localhost:3000/api/sys/appx/login'
	http -a 'appx@LOCAL:P@@dle101' 'http://localhost:3000/api/sys/appx/base/namespace'
