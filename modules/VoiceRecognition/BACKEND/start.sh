./bin/uvicorn --app-dir ./ speech_server:app --workers 4 --host `cat ./hostname`
