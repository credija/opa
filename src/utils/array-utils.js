
export default {
  getRosterByGroup(rosterArray) {
    const arrayByGroup = [];

    for (let i = 0; i < rosterArray.length; i++) {
      const findGroup = arrayByGroup.find(rosterGroup => 
        rosterGroup.group.toUpperCase() === rosterArray[i].group.toUpperCase());
      if (findGroup === undefined) {
        arrayByGroup.push({ group: rosterArray[i].group, contacts: [rosterArray[i]] });
      } else {
        findGroup.contacts.push(rosterArray[i]);
      }
    }

    arrayByGroup.sort(function(obj1, obj2) {
      const textA = obj1.group.toUpperCase();
      const textB = obj2.group.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    
    return arrayByGroup;
  }
};
