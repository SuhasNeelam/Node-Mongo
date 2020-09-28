const deleteButton = document.getElementById("delete-button");
const messageDiv = document.getElementById('messageDiv');
console.log(hname);
deleteButton.addEventListener('click', _ => {
  const hname = document.getElementById("hname").value;
  fetch("/hospitals", {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hname: hname
    })
  })
    .then(res => {
      console.log("Reached DEL");
      if (res.ok) return res.json();
    })
    .then(res =>{
      if (res === 'No hospital to delete') {
        messageDiv.textContent = 'No hospital to delete';
        console.log("No hospital to delete");
      }else{
        messageDiv.textContent = 'deleted';
        window.location.reload();
      }
    })
    .catch(error => console.error(error));
});
