import React, { useState } from 'react';
import {
  Portal,
  Transition,
  MantineNumberSize,
  ClassNames,
  DefaultProps,
  mergeStyles,
} from '@mantine/core';
import { useIsomorphicEffect } from '@mantine/hooks';
import { DropzoneStatus } from '../Dropzone';
import useStyles from './FullscreenDropzone.styles';

export type FullScreenDropzoneStylesNames = ClassNames<typeof useStyles>;

export interface FullScreenDropzoneProps
  extends DefaultProps<FullScreenDropzoneStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onDrop'> {
  /** Space between dropzone and viewport edges */
  offset?: MantineNumberSize;

  /** Overlay z-index */
  zIndex?: number;

  /** Disable dropzone */
  disabled?: boolean;

  /** Accepted mime types */
  accept: string[];

  /** Dropzone padding from theme or number to set padding in px */
  padding?: MantineNumberSize;

  /** Dropzone radius from theme or number to set border-radius in px */
  radius?: MantineNumberSize;

  /** Called when files are dropped to document */
  onDrop(files: File[]): void;

  /** Render children based on dragging state */
  children(status: DropzoneStatus): React.ReactNode;
}

function isValidDrop(event: DragEvent, mime: string[]) {
  const items = event?.dataTransfer?.items;

  if (mime.includes('*')) {
    return true;
  }

  for (let i = 0; i < items?.length; i += 1) {
    if (!mime.includes(items[i].type)) {
      return false;
    }
  }

  return true;
}

export function FullScreenDropzone({
  className,
  style,
  offset = 'xl',
  padding = 'md',
  radius = 'sm',
  classNames,
  styles,
  disabled,
  accept = ['*'],
  zIndex = 1000,
  onDrop,
  children,
  ...others
}: FullScreenDropzoneProps) {
  const { classes, cx } = useStyles(
    { offset, padding, radius },
    classNames,
    'full-screen-dropzone'
  );
  const _styles = mergeStyles(classes, styles);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setError(!isValidDrop(event, accept));
    setVisible(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setVisible(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setVisible(false);
    if (isValidDrop(event, accept)) {
      onDrop(Array.from(event.dataTransfer.files));
    }
  };

  useIsomorphicEffect(() => {
    document.addEventListener('dragover', handleDragOver, false);
    document.addEventListener('dragleave', handleDragLeave, false);
    document.addEventListener('drop', handleDrop, false);

    return () => {
      document.removeEventListener('dragover', handleDragOver, false);
      document.removeEventListener('dragleave', handleDragLeave, false);
      document.removeEventListener('drop', handleDrop, false);
    };
  }, []);

  return (
    <Portal zIndex={zIndex}>
      <Transition
        transition="fade"
        duration={200}
        timingFunction="ease"
        mounted={visible && !disabled}
      >
        {(transitionStyles) => (
          <div
            style={{ ...style, ..._styles.wrapper, ...transitionStyles }}
            className={cx(classes.wrapper, className)}
            {...others}
          >
            <div
              className={cx(
                classes.dropzone,
                {
                  [classes.active]: visible && !error,
                  [classes.reject]: error,
                },
                className
              )}
            >
              {children({ accepted: visible && !error, rejected: error })}
            </div>
          </div>
        )}
      </Transition>
    </Portal>
  );
}

FullScreenDropzone.displayName = '@mantine/dropzone/FullScreenDropzone';
