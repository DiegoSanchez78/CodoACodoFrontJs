const BASEURL = 'http://127.0.0.1:5000';

/**
 * Función para realizar una petición fetch con JSON.
 * @param {string} url - La URL a la que se realizará la petición.
 * @param {string} method - El método HTTP a usar (GET, POST, PUT, DELETE, etc.).
 * @param {Object} [data=null] - Los datos a enviar en el cuerpo de la petición.
 * @returns {Promise<Object>} - Una promesa que resuelve con la respuesta en formato JSON.
 */
async function fetchData(url, method, data = null) {
  const OPTIONS = {
      method: method,
      headers: {
          'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
  };
  try {
    console.log(`Fetching ${url} with method ${method} and data:`, data);
    const response = await fetch(url, OPTIONS);
    if (!response.ok) {
      const errorText = await response.text();  // Obtener el texto del error
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    alert(`An error occurred: ${error.message}`);
    return null;
  }
}


/**
 * Funcion que permite crear un elemento <tr> para la tabla de peliculas
 * por medio del uso de template string de JS.
 */
async function showProductos(){
  let productos = await fetchData(BASEURL + '/api/productos', 'GET');
  const tableProductos = document.querySelector('#list-table-productos tbody');
  tableProductos.innerHTML = '';
  
  if (!Array.isArray(productos)) {
      console.error('Expected an array but got:', productos);
      return;
  }

  productos.forEach((producto) => {
    let tr = `<tr class="tr-crud">
                  <td>${producto.categoria}</td>
                  <td>${producto.nombre_producto}</td>
                  <td>${producto.material}</td>
                  <td>${producto.descripcion}</td>
                  <td>${producto.precio}</td>
                  <td><img class="img-crud" src="${producto.imagen} " alt="" width="60px"></td>
                  
                  <td>
                      <button class="btn-crud" onclick='updateProducto(${producto.id})'><i class="fa-solid fa-pen fa-2xl " style="color: #5b493d;"></i></button>
                  </td>
                  <td>
                      <button class="btn-crud" onclick='deleteProducto(${producto.id})'><i class="fa-solid fa-trash fa-2xl" style="color: #5b493d;"></i></button>
                  </td>
                </tr>`;
    tableProductos.insertAdjacentHTML("beforeend", tr);
  });
}



/**
 * Función para comunicarse con el servidor para poder Crear o Actualizar
 * un registro de pelicula
 * 
 */
async function saveProductos() {
  const idProducto = document.querySelector('#id-producto');
  const categoria = document.querySelector('#categoria');
  const nombre_producto = document.querySelector('#nombre');
  const material = document.querySelector('#material');
  const descripcion = document.querySelector('#descripcion');
  const precio = document.querySelector('#precio');
  const imagen = document.querySelector('#foto');

  // Verificar si los elementos existen
  if (!idProducto || !categoria || !nombre_producto || !material || !descripcion || !precio || !imagen) {
    console.error("Uno o más elementos del formulario no se encontraron.");
    return;
  }

  // Verificar si los valores no son nulos o vacíos
  if (!categoria.value || !nombre_producto.value || !material.value || !descripcion.value || !precio.value || !imagen.value) {
    Swal.fire({
      title: 'Error!',
      text: 'Por favor completa todos los campos.',
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
    return;
  }

  const productoData = {
    categoria: categoria.value,
    nombre_producto: nombre_producto.value,
    material: material.value,
    descripcion: descripcion.value,
    precio: precio.value,
    imagen: imagen.value,
  };

  console.log('Producto data:', productoData);

  let result = null;
  if (idProducto.value !== "") {
    result = await fetchData(`${BASEURL}/api/productos/${idProducto.value}`, 'PUT', productoData);
  } else{
    result = await fetchData(`${BASEURL}/api/productos/`, 'POST', productoData);
  }

  if (result) {
    const formProducto = document.querySelector('#form-producto');
    formProducto.reset();
    Swal.fire({
      title: 'Exito!',
      text: result.message,
      icon: 'success',
      confirmButtonText: 'Cerrar'
    });
    showProductos();
  }
}


/**
 * Function que permite eliminar una producto del array del localstorage
 * de acuedo al indice del mismo
 * @param {number} id posición del array que se va a eliminar
 */
function deleteProducto(id){
    Swal.fire({
        title: "Esta seguro de eliminar el producto?",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
    }).then(async (result) => {
        if (result.isConfirmed) {
          let response = await fetchData(`${BASEURL}/api/productos/${id}`, 'DELETE');
          showProductos();
          Swal.fire(response.message, "", "success");
        }
    });
    
}

/**
 * Function que permite cargar el formulario con los datos del producto 
 * para su edición
 * @param {number} id Id de la pelicula que se quiere editar
 */
async function updateProducto(id) {
  let response = await fetchData(`${BASEURL}/api/productos/${id}`, 'GET');
  
  const idProducto = document.querySelector('#id-producto');
  const categoria = document.querySelector('#categoria');
  const nombre_producto = document.querySelector('#nombre');
  const material = document.querySelector('#material');
  const descripcion = document.querySelector('#descripcion');
  const precio = document.querySelector('#precio');
  const imagen = document.querySelector('#foto');

  // Verificar si los elementos existen
  console.log("idProducto:", idProducto);
  console.log("categoria:", categoria);
  console.log("nombre_producto:", nombre_producto);
  console.log("material:", material);
  console.log("descripcion:", descripcion);
  console.log("precio:", precio);
  console.log("imagen:", imagen);

  if (!idProducto || !categoria || !nombre_producto || !material || !descripcion || !precio || !imagen) {
    console.error("Uno o más elementos del formulario no se encontraron.");
    return;
  }

  idProducto.value = response.id;
  categoria.value = response.categoria;
  nombre_producto.value = response.nombre_producto;
  material.value = response.material;
  descripcion.value = response.descripcion;
  precio.value = response.precio;
  imagen.value = response.imagen;
}

document.addEventListener('DOMContentLoaded', function() {
  const btnSaveMovie = document.querySelector('#btn-save-movie');
  btnSaveMovie.addEventListener('click', saveProductos);
  showProductos();
});