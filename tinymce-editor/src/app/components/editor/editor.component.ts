import { Component } from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  activeField = null;
  constructor() { }

  clickOnEditor(event: any){
    this.resetActive(event);
    this.setActive(event);
    if(this.activeField == event.editor.getBody()){
      this.resetActive(event);
    }
  }

  resetActive(event: any): void {
    if(this.activeField != null){
      event.editor.dom.setStyle(this.activeField, 'background-color', 'transparent');
      event.editor.dom.setStyle(this.activeField, 'border', '1px solid #ccc');
    }
  }

  setActive(event: any): void {
    this.activeField = event.editor.selection.getNode();
    if(this.activeField != event.editor.getBody()){
      let element = this.activeField as any;
      while(element.nodeName != 'TD') {
        this.activeField = element.parentNode;
        element = element.parentNode;
      }
      event.editor.dom.setStyle(this.activeField, 'background-color', '#cce9ff');
      event.editor.dom.setStyle(this.activeField, 'border', 'solid #5591cf');
    }
  }
}
