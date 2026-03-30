import { XmlEditorComponent } from '../xml-editor.component';

export class YADEHandler {
    encryptionKeys = new Map<string, string>();

    constructor(private xmlEditor: XmlEditorComponent) {} 

    cleanup(): void {
      this.encryptionKeys.clear();
    }
    
    // ----- ProtocolFragment/CredentialiStoreFragment part
    showEncryptValueIcon(nodeValue: any){
      // TODO GUI support for CredentialiStoreFragment/CSAuthentication/PasswordAuthentication/CSPassword
      return nodeValue?.enc && !nodeValue?.data?.startsWith("enc:") && nodeValue.parent !== 'CSPassword';
    }

    // - only ProtocolFragments - see TODO above
    encryptValue(node, nodeValue){   
      if(!nodeValue?.enc || !nodeValue?.data){
        return;
      }
      const toastTitle = "Encryption via GUI is not possible."; 
      const fragment = this.getParentFragment(this.xmlEditor.treeCtrl.getTreeNodeByKey(node.parentId));
      if (!fragment || !fragment.origin) {
        this.xmlEditor.showErrorToast("Parent Fragment not found", toastTitle);
        return;
      }

      const decryptionFragmentRef = this.getDecryptionFragmentRef(fragment);
      if (!decryptionFragmentRef) {
        this.xmlEditor.showErrorToast("No DecryptionFragmentRef assigned to the current "+fragment.origin.ref+".", toastTitle);
        return;
      }
      const protocolFragments = fragment.parentNode;
      if (!protocolFragments){
        this.xmlEditor.showErrorToast("ProtocolFragments not found", toastTitle);
        return;
      }
      const fragments = protocolFragments.parentNode;
      if (!fragments) {
        this.xmlEditor.showErrorToast("Fragments not found", toastTitle);
        return;
      }
      const decryptionFragments = fragments.origin.children?.find(
        (child: any) => child.ref === "DecryptionFragments"
      );
      if (!decryptionFragments) {
        this.xmlEditor.showErrorToast("DecryptionFragments not found.", toastTitle);
        return;
      }
      const decryptionFragmentName = decryptionFragmentRef.attributes[0]?.data;
      const decryptionFragment = decryptionFragments.children?.find(
        (child: any) => child.attributes?.some((attr: any) => attr.data === decryptionFragmentName)
      );
      if (!decryptionFragment) {
        this.xmlEditor.showErrorToast("DecryptionFragment name='" + decryptionFragmentName +"' not found", toastTitle);
        return;
      }

      const encryptionKey = decryptionFragment.attributes?.find((a: any) => a.name === "encryption_key")?.data;
      if(!encryptionKey){
        this.xmlEditor.showErrorToast("DecryptionFragment name='"+decryptionFragmentName+"'. The encryption_key is not set.", toastTitle);
        return;
      }
      //const privateKey = decryptionFragment.children?.find((c: any) => c.ref === "EnciphermentPrivateKey")?.values?.[0]?.data;

      //console.dir(node, { depth: null, colors: true });
      this.xmlEditor.coreService.post('encipherment/encrypt', {
        toEncrypt: nodeValue.data,
        certAlias: encryptionKey
      }).subscribe({
        next: (res: any) => {
          nodeValue.data = res.encryptedValue;
        }, error: (error) => {
          if (error && error.error) {
            this.xmlEditor.showErrorToast(error.error.message, toastTitle);
          }
        }
      });
    }

    // ----- DecryptionFragment part - encryption_key attribute - select certAlias --------------------------------------------------
    setDecryptionFragmentEncryptionKeysValues(node: any, attr: any) : boolean {
      if (node?.ref == 'DecryptionFragment' && attr?.name === 'encryption_key') {
          this.setEncryptionKeys(attr);
          return true;
      }
      else{
          return false;
      }
    }  

    submitEncryptionKeyData(selectedNode, value, tag){
      if(value){
          this.getEncryptionPrivateKeyPath(value, (privateKey)=>{
            if(privateKey && selectedNode.children?.[0]?.ref === 'EnciphermentPrivateKey'){
              this.xmlEditor.submitValue(privateKey, "EnciphermentPrivateKey", selectedNode.children[0].values?.[0]);      
            }           
          });
      }
      this.xmlEditor.submitData(value, tag);
    }

    private getDecryptionFragmentRef(fragment: any) {
      return fragment?.origin?.children?.find(
        child => child?.ref === "DecryptionFragmentRef"
      );
    }

    private  getParentFragment(node, counter = 0){
      if (!node?.origin?.parentId || counter > 10){ 
        return null;
      }
      const parent = this.xmlEditor.treeCtrl.getTreeNodeByKey(node.origin.parentId);
      if (parent?.origin.ref?.endsWith("Fragment")) {
        return parent;
      }
  
      if (!parent){ 
        return null;
      }
      return this.getParentFragment(parent, counter+1);
    }

    private setEncryptionKeys(attr){
      this.initEncryptionKeysIfNeeded(() => {
          attr.values = Array.from(this.encryptionKeys.keys()).map(certAlias => ({ value: certAlias }));
      });
    }
    
    private getEncryptionPrivateKeyPath(certAlias: string, callback: (path: string | undefined) => void): void  {
      this.initEncryptionKeysIfNeeded(() => {
          callback(this.encryptionKeys?.get(certAlias));
      });    
    }

    private initEncryptionKeysIfNeeded(callback: () => void): void {
      if (this.encryptionKeys.size > 0) {
          callback();
          return;
      }
    
      this.xmlEditor.coreService.post('encipherment/certificate', {
          agentIds: []
      }).subscribe({
          next: (res: any) => {
            res.certificates.filter((item: any) => item.certAlias).forEach((item: any) => {
            this.encryptionKeys.set(item.certAlias, item.privateKeyPath);
            callback();
          });
          }, error: (error) => {
              if (error && error.error) {
                  this.xmlEditor.showErrorToast(error.error.message, '');
              }
           }
      });    
    }
}