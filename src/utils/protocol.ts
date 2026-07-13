import { readFileSync } from 'node:fs';
import protobuf from 'protobufjs';

const schema = readFileSync(
  new URL('../../resources/google-play.proto', import.meta.url),
  'utf8'
);
const root = protobuf.parse(schema).root;

export const protocol = {
  AndroidCheckinRequest: root.lookupType('AndroidCheckinRequest'),
  AndroidCheckinResponse: root.lookupType('AndroidCheckinResponse'),
  UploadDeviceConfigRequest: root.lookupType('UploadDeviceConfigRequest'),
  ResponseWrapper: root.lookupType('ResponseWrapper'),
};

export function toPlainObject(type: protobuf.Type, data: Uint8Array): Record<string, unknown> {
  return type.toObject(type.decode(data), {
    bytes: String,
    longs: String,
    defaults: false,
  });
}
