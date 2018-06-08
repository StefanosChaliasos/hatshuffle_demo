let sk = '';
let pk = '';
let votes_counter = 0;
let publickey = [];
let ciphertexts = [];
let shuffled_ciphertexts;
let table;
let decrypted_votes;
let ballots_number = 0;
let voters_number = 0;


function decrypt() {
    let vector_ciphers = new Module.Ciphertexts();
    for (var property1 in shuffled_ciphertexts) {
        for (var property2 in shuffled_ciphertexts[property1]) {
            vector_ciphers.push_back(shuffled_ciphertexts[property1][property2][0]);
            vector_ciphers.push_back(shuffled_ciphertexts[property1][property2][1]);
            vector_ciphers.push_back(shuffled_ciphertexts[property1][property2][2]);
            vector_ciphers.push_back(shuffled_ciphertexts[property1][property2][3]);
        }
    }
    sk_neg = "-" + sk
    return Module.decrypt(table, vector_ciphers, sk_neg);
}

$(document).ready(function() {
    $('#set').click(function() {
        voters_number = + $('#voters').val();
        ballots_number =  +  $('#ballots').val();
    });
    $('#keygen').click(function() {
        t0 = performance.now();
        keys = Module.keygen();
        t1 = performance.now();
        sk = keys.split(",")[0];
        pk = keys.split(",")[1];
        $("#keys").text("" + (t1 - t0) + " miliseconds" );
        publickey = [pk.split(' ')[1], pk.split(' ')[2], pk.split(' ')[3],
              pk.split(' ')[4]];
    });
    $('#mixnet').click(function() {
        t0 = performance.now();
        // voting
        for (i = 0; i < voters_number; i++) {
            choice = "" + (Math.floor(Math.random() * ballots_number));
            cipher = Module.vote(pk, choice);
            cipher = cipher.split(',');
            c1 = [cipher[0].split(' ')[1], cipher[0].split(' ')[2],
                  cipher[0].split(' ')[3], cipher[0].split(' ')[4]];
            c2 = [cipher[1].split(' ')[1], cipher[1].split(' ')[2],
                  cipher[1].split(' ')[3], cipher[1].split(' ')[4]];
            ciphertext = [c1, c2];
            ciphertexts.push(ciphertext);
            votes_counter++;
        }
        // mixnet
        serialized_ciphers = {};
        serialized_pk = {};
        serialized = {};
        serialized_pk["pk"] = [pk.split(' ')[1], pk.split(' ')[2],
                               pk.split(' ')[3], pk.split(' ')[4]];
        serialized_ciphers["ciphertexts"] = ciphertexts;
        serialized["ciphertexts"] = serialized_ciphers;
        serialized["pk"] = serialized_pk;
        serialized["votes_counter"] = votes_counter;
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : 'https://snf-824318.vm.okeanos.grnet.gr/api/mix/', // the url where we want to POST
            data        : JSON.stringify(serialized), // our data object
            contentType : 'application/json',
            dataType    : 'json', // what type of data do we expect back from the server
            async       : true,
            encode      : true
        }).done(function(data) {
            json_ciphers = data;
            shuffled_ciphertexts = json_ciphers["output"];
            delete json_ciphers["verify"];
            str_ciphers = JSON.stringify(json_ciphers, undefined, 4);
        });
        t1 = performance.now();
        $("#mix-verify").text("" + (t1 - t0) + " miliseconds" );
    });
    $('#create_table').click(function() {
        t0 = performance.now();
        table = Module.create_table(3);
        t1 = performance.now();
        $("#table").text("" + (t1 - t0) + " miliseconds");
    });
    $('#decrypt_server').click(function() {
        t0 = performance.now();
        serialized_secret = {};
        serialized_secret["secret"] = sk;
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : 'https://snf-824318.vm.okeanos.grnet.gr/api/decrypt/', // the url where we want to POST
            data        : JSON.stringify(serialized_secret), // our data object
            contentType : 'application/json',
            dataType    : 'json', // what type of data do we expect back from the server
            async       : true,
            encode      : true
        }).done(function(data) {
            json_votes = data;
            str_votes = JSON.stringify(json_votes, undefined, 4);
            t1 = performance.now();
            $("#decrypted_server").text("" + (t1 - t0) + " miliseconds");
        });
    });
    $('#decrypt_client').click(function() {
        t0 = performance.now();
        decrypted_votes = decrypt();
        d_votes = "";
        for (i = 0; i < decrypted_votes.size(); i++) {
            d_votes += "" + decrypted_votes.get(i) + " ";
        }
        t1 = performance.now();
        $("#decrypted_client").html("" + (t1 - t0) + " miliseconds");
    });
});
