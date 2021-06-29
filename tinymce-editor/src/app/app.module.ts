import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AppComponent } from './app.component';
import { EditorComponent } from './components/editor/editor.component';
import { TreeStructureComponent } from './components/tree-structure/tree-structure.component';
import { PropertiesComponent } from './components/properties/properties.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    TreeStructureComponent,
    PropertiesComponent
  ],
  imports: [
    BrowserModule,
    EditorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
