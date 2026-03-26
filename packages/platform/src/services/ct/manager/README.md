# Proto Buffers

These buffer files can be found at the following repo: https://github.com/spotware/openapi-proto-messages

## Usage

Install `protoc` on your system.

```bash
brew install protobuf
```

To generate the TypeScript stubs, run the following:

```bash
pnpm protoc \
--plugin=./node_modules/.bin/protoc-gen-ts_proto \
--proto_path=./libs/nest/modules/platform/services/ct/manager/proto/ \
--ts_proto_out=./libs/nest/modules/platform/services/ct/manager/proto/ts ./libs/nest/modules/platform/services/ct/manager/proto/*.proto \
--ts_proto_opt=nestJs=true \
--ts_proto_opt=outputIndex=true \
--ts_proto_opt=esModuleInterop=true \
--ts_proto_opt=forceLong=long \
--ts_proto_opt=env=node;
```