export const resizeImage = ({
  width,
  height,
  minHeight,
  minWidth,
  maxHeight,
  maxWidth,
}: {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
}) => {
  const size = {
    width,
    height,
  };

  const naturalRatio = width / height;
  const updateHeight = (height: number) => {
    size.height = height;
    size.width = height * naturalRatio;
  };
  const updateWidth = (width: number) => {
    size.width = width;
    size.height = width / naturalRatio;
  };

  if (size.width < minWidth) {
    updateWidth(minWidth);
  }
  if (size.height < minHeight) {
    updateHeight(minHeight);
  }
  if (size.width > maxWidth) {
    updateWidth(maxWidth);
  }
  if (size.height > maxHeight) {
    updateHeight(maxHeight);
  }

  if (
    size.width < minWidth ||
    size.width > maxWidth ||
    size.height < minHeight ||
    size.height > maxHeight
  ) {
    console.warn(
      `[MdBox] Image cannot be resized to the specified size: Natural size: {${width},${height}} Resized size: {${size.width},${size.height}} Min size: {${minWidth},${minHeight}} Max size: {${maxWidth},${maxHeight}}`,
    );
  }

  return size;
};
