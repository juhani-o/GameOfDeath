import xml.dom.minidom as minidom
import pprint

""" 
  Read svg and export data as js function

  If needed transform can be calculated
  x = a*x + c*y + e 
  y = b*x + d*y + f

  (calculation is not done now, )

 """  

def main():
    doc = minidom.parse('graph/viikatemies_6.svg')

    nodes = doc.childNodes[0].childNodes

    #import pdb; pdb.set_trace()
    #result = "var init = function () { data = {"
    result ="{" 
    for node in nodes:
        if node.nodeType == minidom.Node.ELEMENT_NODE:
            item_name = node.getAttribute('id')
            transform = node.getAttribute('transform')
            result += f"{item_name}: {{ transform: \'{transform}\', data: ["
            items = ', '.join([f"'{svgelement.getAttribute('d')}'" for svgelement in node.getElementsByTagName('path')])
            result += items
            result +=']},'
    
    result = result[:-1]+'}'

    #print(pprint.PrettyPrinter(indent=4).pprint(result))
    print(result)

if __name__ == "__main__":
    main()
