import { defaultConfig } from '../config';
import { ParseSourceSpan } from '../parse-source-span';

import { Node } from './node';

/**
 * Representation of the HTML `<!-- -->` tag
 * Resembles the @angular/compiler `Comment` class
 * {@link https://github.com/angular/angular/blob/cf0968f98e844043a0f6c2548201f3c0dfd329a7/packages/compiler/src/ml_parser/ast.ts}
 */
export class Comment extends Node {
  /**
   * Directive character to identify Comment
   */
  public static readonly LML_DIRECTIVE = '#';

  /**
   * @argument data Text content
   * @argument sourceSpan Full string source span (including the HTML tag or LML directive character)
   */
  constructor(public data: string, sourceSpan: ParseSourceSpan) {
    super(sourceSpan);
  }

  public toHtml(config = defaultConfig, tabulation = ''): string {
    const data = this.data.trim();
    const lf = config.minify ? '' : '\n';
    const spc = config.minify ? '' : ' ';
    return data ? `${tabulation}<!--${spc}${this.lmlMultilineIndentation(data, config, tabulation)}${spc}-->${lf}` : '';
  }

  public toJSON(_config = defaultConfig): Object {
    return this.json({type: 'comment', data: this.data.trim()});
  }

  public toLml(config = defaultConfig, tabulation = ''): string {
    const data = this.data.trim();
    return data ? `${tabulation}${Comment.LML_DIRECTIVE} ${this.lmlMultilineIndentation(data, config, tabulation)}\n` : '';
  }
}