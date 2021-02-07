/** @see https://github.com/nestjs/swagger/blob/master/lib/utils/validate-path.util.ts **/
export const validatePath = (inputPath: string): string =>
  inputPath.charAt(0) !== '/' ? '/' + inputPath : inputPath
