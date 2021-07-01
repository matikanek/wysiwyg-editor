import { Component } from '@angular/core';
import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode } from 'src/app/models/tree-item.model';
import { ActiveElement } from 'src/app/models/active-element.model';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  activeField = null;
  dataTree: FlatNode[] = []
  activeElement: ActiveElement = {
    font: '', size: '', weight: '', color: '', coords: {x: 0, y: 0}, width: 0, height: 0
  };
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);
  dataSource = new ArrayDataSource(this.dataTree);
  hasChild = (_: number, node: FlatNode) => node.expandable;
  listOfTags = ['table', 'tr', 'td', 'img', 'p'];

  getParentNode(node: FlatNode) {
    const nodeIndex = this.dataTree.indexOf(node);
    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.dataTree[i].level === node.level - 1) {
        return this.dataTree[i];
      }
    }
    return null;
  }

  shouldRender(node: FlatNode) {
    let parent = this.getParentNode(node);
    while (parent) {
      if (!parent.isExpanded) {
        return false;
      }
      parent = this.getParentNode(parent);
    }
    return true;
  }

  clickOnTreeItem(event: any): void {
    this.removeActiveFromTree();
    let nodeName = event.toElement.innerText;
    let selectedElementIndex = this.getSelectecElementIndex(event, nodeName);
    let selectedElementHandle = document.getElementsByTagName('iframe')[0]
      .contentWindow?.document.getElementsByTagName(nodeName.trim())[selectedElementIndex];
    this.disableCurrentActiveElement()
    this.setActiveOnEditor(selectedElementHandle);
  }

  setActiveOnEditor(node: any): void {
    node.style.backgroundColor = '#cce9ff';
    node.style.border = 'solid #5591cf';
  }

  removeActiveFromTree(): void {
    let active = document.getElementsByClassName('editor__container-structure-active-item')[0];
    //console.log(active);
    if(active != null) {
      //for(let i=0; i<active.length; i++) {
        active.classList.remove('editor__container-structure-active-item');
      //}
    }
  }

  disableCurrentActiveElement(): void {
    let editorTags = 
      Array.prototype.slice.call(
        document.getElementsByTagName('iframe')[0]
        .contentWindow?.document.getElementsByTagName('*')
      )
      .filter((item)=>{
        return this.listOfTags.includes(item.nodeName.toLocaleLowerCase());
      });
    for(let i=0; i<editorTags.length; i++) {
      if(editorTags[i].style.backgroundColor == 'rgb(204, 233, 255)') {
        editorTags[i].style.backgroundColor = 'transparent';
        editorTags[i].style.border = '1px solid #ccc';
        break;
      }
    }
  }

  getSelectecElementIndex(event: any, node: string): number {
    let selectedElement = event.path[1];
    selectedElement.setAttribute('flex-direction', 'row');
    selectedElement.children[0].classList.add('editor__container-structure-active-item');
    let collection = Array.prototype.slice.call(event.path[2].children).filter((item: any)=> {
      return item.innerText.trim() == node.trim();
    });
    let selectedElementIndex = 0;
    for(let i=0; i<collection.length; i++) {
      if(collection[i].getAttribute('flex-direction') == 'row'){
        selectedElementIndex = i;
      }
    }
    selectedElement.removeAttribute('flex-direction');
    return selectedElementIndex;
  }

  clickOnEditor(event: any){
    this.removeActiveFromTree()
    this.resetTree();
    this.disableCurrentActiveElement();
    this.setActive(event);
    this.clearActive(event);
    this.initTree(event);

    this.treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);
    this.dataSource = new ArrayDataSource(this.dataTree);
    this.hasChild = (_: number, node: FlatNode) => node.expandable;

    console.log(this.dataTree);
  }

  clearActive(event: any): void {
    if(this.activeField == event.editor.getBody()) {
      this.resetActive(event);
    }
  }

  initTree(event: any): void {
    let content = document.createElement('html');
    content.innerHTML = event.editor.getContent();
    this.createTree(content.getElementsByTagName('body')[0]);
  }

  createTree(currentNode: any): void {
    this.createFlatNodeItem(currentNode);
    if(currentNode.children.length != 0 ) {
      for(let i=0; i<currentNode.children.length; i++){
        this.createTree(currentNode.children[i]);
      }
    }
    else {
      if(this.dataTree.length != 0) {
        this.dataTree[this.dataTree.length-1].expandable = false;
      }
      return; 
    }
  }

  createFlatNodeItem(currentNode: any): void {
    if(this.listOfTags.includes(currentNode.nodeName.toLocaleLowerCase())){
      let flatNodeItem: FlatNode = {name: '', level: 0, expandable: true, isActive: false};
      flatNodeItem = this.itemSetName(flatNodeItem, currentNode);
      flatNodeItem = this.itemSetLevel(flatNodeItem, currentNode);
      flatNodeItem = this.itemSetIsActive(flatNodeItem, currentNode);
      this.dataTree.push(flatNodeItem);
    }
  }

  itemSetName(flatNodeItem: FlatNode, node: any): FlatNode {
    flatNodeItem.name = node.nodeName;
    return flatNodeItem;
  }

  itemSetLevel(flatNodeItem: FlatNode, node: any): FlatNode {
    let lvl = 0;
    while(node.parentNode.nodeName != 'BODY'){
      if(this.listOfTags.includes(node.parentNode.nodeName.toLocaleLowerCase())){
        lvl += 1;
      }
      node = node.parentNode;
    }  
    flatNodeItem.level = lvl;
    return flatNodeItem;
  }

  itemSetIsActive(flatNodeItem: FlatNode, node: any): FlatNode {
    while(node.parentNode.nodeName != 'BODY' && node.nodeName != 'TD'){
      node = node.parentNode;
    }
    if(node.style.backgroundColor == 'rgb(204, 233, 255)'){
      flatNodeItem.isActive = true;
    }
    else { flatNodeItem.isActive = false; }
    return flatNodeItem;
  }

  resetTree(): void {
    this.dataTree = [];
    this.activeElement = {
      font: '', size: '', weight: '', color: '', coords: {x: 0, y: 0}, width: 0, height: 0
    };
  }

  resetActive(event: any): void {
    let element = this.activeField as any;
    if(this.activeField != null && element.nodeName == 'TD'){
      event.editor.dom.setStyle(this.activeField, 'background-color', 'transparent');
      event.editor.dom.setStyle(this.activeField, 'border', '1px solid #ccc');
    }
  }

  setActive(event: any): void {
    this.activeField = event.editor.selection.getNode();
    this.funkcja(event);
    if(this.activeField != event.editor.getBody()){
      let element = this.activeField as any;
      while(element.nodeName != 'TD' && element.nodeName != 'BODY') {
        this.activeField = element.parentNode;
        element = element.parentNode;
      }
      if(element.nodeName == 'TD') {
        event.editor.dom.setStyle(this.activeField, 'background-color', '#cce9ff');
        event.editor.dom.setStyle(this.activeField, 'border', 'solid #5591cf');
      }
    }
    this.resetTree();
  }

  funkcja(event: any): void {
    let activeElement = this.activeField as any;
    if(activeElement.nodeName != 'IMG') {
      this.activeElement.isImage = false;
      this.activeElement.font = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('font-family');
      this.activeElement.size = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('font-size');
      this.activeElement.weight = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('font-weight');
      this.activeElement.color = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('color');
    }
    else {
      this.activeElement.isImage = true;
      this.activeElement.coords.x = Math.round(event.editor.selection.getBoundingClientRect().x);
      this.activeElement.coords.y = Math.round(event.editor.selection.getBoundingClientRect().y);
      this.activeElement.width = Math.round(event.editor.selection.getBoundingClientRect().width);
      this.activeElement.height = Math.round(event.editor.selection.getBoundingClientRect().height);
    }
  }
}
