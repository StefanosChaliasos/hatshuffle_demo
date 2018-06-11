let sk = '';
let pk = '';
let votes_counter = 0;
let publickey = [];
let ciphertexts = [];
let shuffled_ciphertexts;
let table;
let decrypted_votes;

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

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

$(document).ready(function() {
    $('#keygen').click(function() {
        keys = Module.keygen();
        sk = keys.split(",")[0];
        pk = keys.split(",")[1];
        $("#sk").text(sk);
        $("#pk").text(pk);
        publickey = [pk.split(' ')[1], pk.split(' ')[2], pk.split(' ')[3],
              pk.split(' ')[4]];
    });
    $('#vote').click(function() {
        choice = $('select[name=mvp]').val();
        cipher = Module.vote(pk, choice);
        $("#cipher").text(cipher);
        cipher = cipher.split(',');
        c1 = [cipher[0].split(' ')[1], cipher[0].split(' ')[2],
              cipher[0].split(' ')[3], cipher[0].split(' ')[4]];
        c2 = [cipher[1].split(' ')[1], cipher[1].split(' ')[2],
              cipher[1].split(' ')[3], cipher[1].split(' ')[4]];
        ciphertext = [c1, c2];
        ciphertexts.push(ciphertext);
        votes_counter++;
    });
    $('#mixnet').click(function() {
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
            $("#ver").text(data["verify"]);
            json_ciphers = data;
            shuffled_ciphertexts = json_ciphers["output"];
            delete json_ciphers["verify"];
            str_ciphers = JSON.stringify(json_ciphers, undefined, 4);
            $("#shuffled").html(syntaxHighlight(str_ciphers));
        });
    });
    $('#decrypt_server').click(function() {
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
            $("#decrypted_server").html(syntaxHighlight(str_votes));
        });
    });
    $('#create_table').click(function() {
        table = Module.create_table(3);
        $("#table").text(table.size());
    });
    $('#decrypt_client').click(function() {
        decrypted_votes = decrypt();
        d_votes = "";
        for (i = 0; i < decrypted_votes.size(); i++) {
            d_votes += "" + decrypted_votes.get(i) + " ";
        }
        $("#decrypted_client").html(d_votes);
    });
});
