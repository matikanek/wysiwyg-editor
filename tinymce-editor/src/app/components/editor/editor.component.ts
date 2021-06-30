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

  clickOnEditor(event: any){
    this.resetTree();
    this.resetActive(event);
    this.setActive(event);
    this.clearActive(event);
    this.initTree(event);

    this.treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);
    this.dataSource = new ArrayDataSource(this.dataTree);
    this.hasChild = (_: number, node: FlatNode) => node.expandable;
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
  }

  funkcja(event: any): void {
    let activeElement = this.activeField as any;
    let activeItem: ActiveElement = {
      isImage: false, font: '', size: '', weight: '', color: '', coords: {x: 0, y: 0}, width: 0, height: 0
    };
    if(activeElement.nodeName != 'IMG') {
      activeItem.isImage = false;
      activeItem.font = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('font-family');
      activeItem.size = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('font-size');
      activeItem.weight = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('font-weight');
      activeItem.color = window.getComputedStyle(event.editor.selection.getNode(), null).getPropertyValue('color');
      console.log(activeItem);
    }
    else {
      activeItem.isImage = true;
      activeItem.coords.x = Math.round(event.editor.selection.getBoundingClientRect().x);
      activeItem.coords.y = Math.round(event.editor.selection.getBoundingClientRect().y);
      activeItem.width = event.editor.selection.getBoundingClientRect().width;
      activeItem.height = event.editor.selection.getBoundingClientRect().height;
      console.log(activeItem);
    }
  }
}
