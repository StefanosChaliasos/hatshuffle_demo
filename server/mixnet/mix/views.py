import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
import hatshufflepy
import sys

ROOT_PATH = os.path.dirname(os.path.abspath(__file__))
FILES_PATH = ROOT_PATH + "/../files"
crs_file = FILES_PATH + "/crs.json"
votes_file = FILES_PATH + "/votes.json"
ciphertexts_file = FILES_PATH + "/ciphertexts.json"
proofs_file = FILES_PATH + "/proofs.json"
decrypted_votes_file = FILES_PATH + "/decrypted_votes.json"
pk_file = FILES_PATH + "/pk"
sk_file = FILES_PATH + "/sk"


class MixAPIView(APIView):
    def post(self, request):
        out = request.data
        with open(ciphertexts_file, 'w') as outfile:
            json.dump(out["ciphertexts"], outfile)
        with open(pk_file, 'w') as outfile:
            json.dump(out["pk"], outfile)
        votes_number = int(out["votes_counter"])
        hatshufflepy.hat_shuffle_create_crs(votes_number, crs_file, pk_file)
        hatshufflepy.hat_shuffle_prove(crs_file,
                                       ciphertexts_file,
                                       proofs_file)
        with open(proofs_file) as f:
            data_json = json.load(f)
        data = data_json["Online_proof"]
        del data["consist"]
        data['verify'] = hatshufflepy.hat_shuffle_verify(crs_file,
                                                         ciphertexts_file,
                                                         proofs_file)
        return Response(data, status=status.HTTP_200_OK)


class VoteMixAPIView(APIView):
    def post(self, request):
        out = request.data
        with open(pk_file, 'w') as outfile:
            json.dump(out["pk"], outfile)
        votes_number = int(out["voters_number"])
        ballots_number = int(out["ballots_number"])
        hatshufflepy.hat_shuffle_create_crs(votes_number, crs_file, pk_file)
        hatshufflepy.hat_shuffle_demo_voting(votes_number, ballots_number,
                                             pk_file, votes_file)
        hatshufflepy.hat_shuffle_encrypt(crs_file, votes_file,
                                         ciphertexts_file)
        hatshufflepy.hat_shuffle_prove(crs_file, ciphertexts_file, proofs_file)
        with open(proofs_file) as f:
            data_json = json.load(f)
        data = data_json["Online_proof"]
        del data["consist"]
        data['verify'] = hatshufflepy.hat_shuffle_verify(crs_file,
                                                         ciphertexts_file,
                                                         proofs_file)
        return Response(data, status=status.HTTP_200_OK)


class DecryptAPIView(APIView):
    def post(self, request):
        out = request.data["secret"]
        with open(sk_file, "w") as text_file:
            text_file.write("%s" % out)
        #  Create votes_file in server
        hatshufflepy.hat_shuffle_decrypt(crs_file, votes_file, proofs_file,
                                         decrypted_votes_file, sk_file)
        with open(decrypted_votes_file) as f:
            data = json.load(f)
        return Response(data, status=status.HTTP_200_OK)
