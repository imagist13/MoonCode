.PHONY: run build fmt vet test smoke

# 本地启动（监听 8080，读 ./pkg/config 中的环境变量）。
run:
	go run ./cmd/server

# 产出二进制到 ./bin/server。
build:
	mkdir -p bin
	go build -o bin/server ./cmd/server

fmt:
	go fmt ./...

vet:
	go vet ./...

test:
	go test ./...

# 跑 scripts/smoke.sh：注册→登录→发文章→按 slug 拉取。
smoke:
	bash scripts/smoke.sh