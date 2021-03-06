import { DOMNode } from '../../dom-node';
import { DOMNodeAttribute } from '../../dom-node-attribute';
import { JSONModel } from '../../json-model';
import { ObjectOutput } from '../object-output';

/**
 * Parses DOMNode[] to JSONModel[]
 */
export class JSONOutput extends ObjectOutput<JSONModel> {
  public convert(nodes = this.nodes): JSONModel[] {
    return nodes.map((node) => this[node.type](node));
  }

  public cdata(node: DOMNode): JSONModel {
    return this.sanitize({type: node.type, children: this.convert(node.children)});
  }

  public comment(node: DOMNode): JSONModel {
    return {type: node.type, data: node.data};
  }

  public directive(node: DOMNode): JSONModel {
    return {type: node.type, data: node.data};
  }

  public element(node: DOMNode): JSONModel {
    const attributes = DOMNodeAttribute.sort(node.attributes, this.config.orderAttributes)
      .map((attrib) => attrib.value ? {name: attrib.name, value: attrib.value} : {name: attrib.name});
    return this.sanitize({type: node.type, name: node.name, attributes, children: this.convert(node.children)});
  }

  public text(node: DOMNode): JSONModel {
    return {type: node.type, data: node.data};
  }
}
