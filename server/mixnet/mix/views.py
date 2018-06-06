from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
#  import hatshufflepy

crs_file = "crs.json"
votes_file = "votes.json"
ciphertexts_file = "ciphertexts.json"
proofs_file = "proofs.json"
decrypted_votes_file = "decrypted_votes.json"


class MixAPIView(APIView):
    def post(self, request):
        out = request.data
        with open(ciphertexts_file, 'w') as outfile:
            json.dump(out["ciphertexts"], outfile)
        with open('pk', 'w') as outfile:
            json.dump(out["pk"], outfile)
        votes_number = int(out["votes_counter"])
        #  hatshufflepy.hat_shuffle_create_crs(votes_number, crs_file)
        #  hatshufflepy.hat_shuffle_prove(crs_file,
        #  ciphertexts_file,
        #  proofs_file)
        with open(proofs_file) as f:
            data_json = json.load(f)
        data = data_json["Online_proof"]
        del data["consist"]
        data['verify'] = True
        #  data['verify'] = hatshufflepy.hat_shuffle_verify(crs_file,
        #  ciphertexts_file,
        #  proofs_file)
        return Response(data, status=status.HTTP_200_OK)


class DecryptAPIView(APIView):
    def post(self, request):
        out = request.data["secret"]
        with open("sk", "w") as text_file:
            text_file.write("%s" % out)
        #  Create votes_file in server
        #  hatshufflepy.hat_shuffle_decrypt(crs_file, votes_file, proofs_file,
        #  decrypted_votes_file)
        with open(decrypted_votes_file) as f:
            data = json.load(f)
        return Response(data, status=status.HTTP_200_OK)
