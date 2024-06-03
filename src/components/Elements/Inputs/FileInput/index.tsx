import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { hexToU8a, isHex, u8aToString } from '@polkadot/util';
import React, { createRef, useCallback, useState } from 'react';
import type { DropzoneRef } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

import styles from './index.module.scss';

export interface InputFilePropsBase {
  className?: string;
  clearContent?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  isFull?: boolean;
  icon: React.ReactNode;
  label: string;
}

export interface InputFileProps extends InputFilePropsBase {
  accept?: string[];
  onChange?: (_contents: Uint8Array) => void;
  onCancel?: () => void;
}

interface FileState {
  name: string;
  size: number;
}

const BYTE_STR_0 = '0'.charCodeAt(0);
const BYTE_STR_X = 'x'.charCodeAt(0);
const STR_NL = '\n';
const NOOP = (): void => undefined;

function convertResult(result: ArrayBuffer): Uint8Array {
  const data = new Uint8Array(result);

  // this converts the input (if detected as hex), via the hex conversion route
  if (data[0] === BYTE_STR_0 && data[1] === BYTE_STR_X) {
    let hex = u8aToString(data);

    while (hex.endsWith(STR_NL)) {
      hex = hex.substring(0, hex.length - 1);
    }

    if (isHex(hex)) {
      return hexToU8a(hex);
    }
  }

  return data;
}

function InputFile({
  accept,
  isDisabled,
  icon,
  label,
  onChange,
  onCancel,
}: InputFileProps): React.ReactElement<InputFileProps> {
  const dropRef = createRef<DropzoneRef>();
  const [file, setFile] = useState<FileState | undefined>();

  const onDrop = useCallback(
    (files: File[]): void => {
      files.forEach((file): void => {
        const reader = new FileReader();

        reader.onabort = NOOP;
        reader.onerror = NOOP;

        reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
          if (target?.result) {
            const name = file.name;
            const data = convertResult(target.result as ArrayBuffer);

            onChange && onChange(data);
            dropRef &&
              setFile({
                name,
                size: data.length,
              });
          }
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [dropRef, onChange]
  );

  const { getInputProps, getRootProps } = useDropzone({
    accept: accept?.reduce((all, mime) => ({ ...all, [mime]: [] }), {}),
    disabled: isDisabled,
    onDrop,
  });

  return (
    <div className={styles.container}>
      {!file ? (
        <div className={styles.upload} {...getRootProps()}>
          {icon}
          {label}
          <input {...getInputProps()} />
        </div>
      ) : (
        <div className={styles.hasFile}>
          <IconButton className={styles.closeIcon} onClick={onCancel}>
            <CloseIcon />
          </IconButton>
          <div className={styles.fileName}>{file.name}</div>
          <div
            className={styles.fileSize}
          >{`(${file.size.toLocaleString()} bytes)`}</div>
        </div>
      )}
    </div>
  );
}

export const FileInput = React.memo(InputFile);
