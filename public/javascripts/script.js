let qty = 1;

function changeQty(event) {
    var quantity = event.target.value;
    qty = quantity;
}


function call(proId, proName) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'post',
        data: { "qty": qty },
        success: (response) => {
            console.log(response);

            if (response.status == 'redirect') {
                Swal.fire({
                    icon: 'info',
                    title: 'You are Not Signed IN',
                    text: 'To Add the Product to your cart . Please Signin to your Account! ',
                    footer: 'Redirecting in 3 Seconds'
                })

                setTimeout(() => { window.location.href = '/signin'; }, 1000)

            }
            else {

                Swal.fire(
                    'Added to Cart!',
                    'The product' + proName + ' Has been Added to your Cart!',
                    'success'
                )
                document.getElementById('cartCountHeader').innerText = response.cartCount;

            }
        }
    })
}


function searchData(e)
{
    const searchResults = document.getElementById('searchResults')
fetch('/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({payload : e.value}),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      let countries = []
     
      data.forEach((item,index)=>{

            countries[index] = item.Name
       
      })
      
autocomplete(document.getElementById("myInput"), countries);
  
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    
}




function addtoWishlist(proId, proName) {
    console.log("addtoWishlist")
    $.ajax({
        url: '/add-to-wishlist',
        method: 'post',
        data: { proId },
        success: (response) => {
            console.log(response);

            if (response == 'redirect') {
                Swal.fire({
                    icon: 'info',
                    title: 'You are Not Signed IN',
                    text: 'To Add the Product to your wishlist . Please Signin to your Account! ',
                    footer: 'Redirecting in 2 Seconds'
                })

                setTimeout(() => { window.location.href = '/signin'; }, 2000)

            }
            else {

                Swal.fire(
                    'Added to Wishlist!',
                    'The product' + proName + ' Has been Added to your Wishlist!',
                    'success'
                )

            }
        }
    })
}





function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_RJxtCwJGEm4Esd", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Gadget Tech",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open(); 
}
function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: { payment, order },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = "/order-confirmed/" + order.id;

                /*  Swal.fire(
                      'Successful!',
                      'Your Order has been placed Successfully',
                      'success'
                  )
                  setTimeout(() => { location.href = "/orders" }, 1000)*/
            }
            else {

                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed!...',
                    text: 'Your Order payment is pending!',
                })
                setTimeout(() => { location.href = "/dashboard/orders" }, 2000)
            }

        }
    })
}

///////////////////////////////////////////////////////////////////////Address //////////////////////////////////////////////////////////

function deleteAddress(addressId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to delete this Address!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/deleteAddress/' + addressId,
                type : 'delete',
                data: { "addressId": addressId },
                success: (cartTotal) => {
                    Swal.fire(
                        'Deleted!',
                        'The address has been deleted',
                        'success',
                    )
                    setTimeout(() => { location.reload(); }, 1000)
                    //document.getElementById(proId).style.display = "none"

                }
            })
        }
    })
}

function showAddress(addressId)
{
    $.ajax({
        url: '/getAddress/'+addressId,
        method: 'get',
        success: (address)=> {
          console.log(address);
          
          document.getElementById('addressfname').value = address.fname;
          document.getElementById('addresslname').value = address.lname;
          document.getElementById('addresscompany').value = address.company;
          document.getElementById('addresscountry').value = address.country;
          document.getElementById('addressAddress').value = address.address;
          document.getElementById('addresscity').value = address.city;
          document.getElementById('addressstate').value = address.state;
          document.getElementById('addresspinCode').value = address.pinCode;
          document.getElementById('addressphone').value = address.phone;
          document.getElementById('addressmail').value = address.mail;
        }
     });
}

$('#editAddress').submit((e) => {
    e.preventDefault();
    console.log('clicked')
    $.ajax({
        url: '/editAddress',
        type:'PUT',
        data: $("#editAddress").serialize(),
        success: (status) => {
            console.log(status)

            Swal.fire(
                'Successful!',
                'Your Address has been Successfully Updated !',
                'success'
            )
            setTimeout(() => { window.location.reload() }, 1000)

        }
    })
})



