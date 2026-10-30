#!/usr/bin/env python3
"""Configure Cloudflare pour fund-road.com : tunnel `fundroad`, DNS du site et messagerie IONOS conservée.

À lancer une fois depuis la racine du projet. Lit le jeton dans gopass (cloudflare/api-token),
n'affiche aucun secret et écrit le jeton du tunnel dans .env.production.
Le basculement des serveurs DNS chez le bureau d'enregistrement reste une étape manuelle.
"""
import json
import os
import re
import subprocess
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"
TOKEN = subprocess.run(
    ["gopass", "show", "-o", "cloudflare/api-token"], capture_output=True, text=True, check=True
).stdout.strip()


def call(method, path, body=None):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"},
    )
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        return json.load(e)


def errors(r):
    return [e["message"] for e in r.get("errors", [])]


account = call("GET", "/accounts")["result"][0]["id"]
zone = call("GET", "/zones?name=fund-road.com")["result"][0]["id"]

# 1. Tunnel géré à distance, branché sur l'API du compose de production
found = call("GET", f"/accounts/{account}/cfd_tunnel?name=fundroad&is_deleted=false")["result"]
if found:
    tunnel = found[0]["id"]
    print("tunnel existant réutilisé")
else:
    r = call("POST", f"/accounts/{account}/cfd_tunnel", {"name": "fundroad", "config_src": "cloudflare"})
    print("création du tunnel :", "ok" if r["success"] else errors(r))
    tunnel = r["result"]["id"]
r = call(
    "PUT",
    f"/accounts/{account}/cfd_tunnel/{tunnel}/configurations",
    {
        "config": {
            "ingress": [
                {"hostname": "fund-road.com", "service": "http://api:3184"},
                {"hostname": "www.fund-road.com", "service": "http://api:3184"},
                {"service": "http_status:404"},
            ]
        }
    },
)
print("routage du tunnel :", "ok" if r["success"] else errors(r))
token = call("GET", f"/accounts/{account}/cfd_tunnel/{tunnel}/token")["result"]
env = open(".env.production").read()
open(".env.production", "w").write(re.sub(r"^TUNNEL_TOKEN=.*$", "TUNNEL_TOKEN=" + token, env, flags=re.M))
print("jeton du tunnel écrit dans .env.production")

# 2. DNS : le site passe par le tunnel (proxifié) ; la messagerie IONOS reste en DNS seul
target = f"{tunnel}.cfargotunnel.com"
records = [
    ("CNAME", "fund-road.com", target, True, None),
    ("CNAME", "www.fund-road.com", target, True, None),
    ("MX", "fund-road.com", "mx00.ionos.fr", False, 10),
    ("MX", "fund-road.com", "mx01.ionos.fr", False, 10),
    ("TXT", "fund-road.com", "v=spf1 include:_spf-eu.ionos.com ~all", False, None),
    ("CNAME", "autodiscover.fund-road.com", "adsredir.ionos.info", False, None),
    ("CNAME", "_dmarc.fund-road.com", "dmarc.ionos.fr", False, None),
    ("CNAME", "s1-ionos._domainkey.fund-road.com", "s1.dkim.ionos.com", False, None),
    ("CNAME", "s2-ionos._domainkey.fund-road.com", "s2.dkim.ionos.com", False, None),
]
for kind, name, content, proxied, priority in records:
    body = {"type": kind, "name": name, "content": content, "ttl": 1}
    if kind == "CNAME":
        body["proxied"] = proxied
    if priority is not None:
        body["priority"] = priority
    r = call("POST", f"/zones/{zone}/dns_records", body)
    print(f"{kind:5} {name:36}", "ok" if r["success"] else errors(r))
