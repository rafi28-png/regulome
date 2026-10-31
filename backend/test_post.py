import httpx

BASE = 'http://localhost:8000/api/v1'

print("--- Testing POST Endpoints ---\n")

try:
    # 1. Test signup
    r = httpx.post(BASE + '/auth/signup', json={'email':'test@regulome.io','password':'Password123!','name':'Test User'}, timeout=10)
    print(f'Signup: {r.status_code}')
    if r.status_code == 200:
        data = r.json()
        token = data.get("access_token", "")
        print(f'  Token: {token[:30]}...')
        print(f'  User: {data["name"]} ({data["email"]})')

    # 2. Test duplicate signup
    r2 = httpx.post(BASE + '/auth/signup', json={'email':'test@regulome.io','password':'Pass2!','name':'Dupe'}, timeout=10)
    print(f'Duplicate signup: {r2.status_code} (expected 409)')

    # 3. Test login
    r3 = httpx.post(BASE + '/auth/login', json={'email':'test@regulome.io','password':'Password123!'}, timeout=10)
    print(f'Login: {r3.status_code}')

    # 4. Test bad login
    r4 = httpx.post(BASE + '/auth/login', json={'email':'test@regulome.io','password':'wrong'}, timeout=10)
    print(f'Bad login: {r4.status_code} (expected 401)')

    # 5. Test /auth/me with token
    if r3.status_code == 200:
        token = r3.json()['access_token']
        r5 = httpx.get(BASE + '/auth/me', headers={'Authorization': f'Bearer {token}'}, timeout=10)
        print(f'Auth /me profile fetch: {r5.status_code} => {r5.json()}')

    # 6. Test custom simulation
    scenario = {'id':'custom','label':'High Sleep','adjustments':{'sleep':0.5,'stress':-0.4}}
    r6 = httpx.post(BASE + '/simulator/inflammatory/simulate', json=scenario, timeout=10)
    print(f'\nCustom simulation: {r6.status_code}')
    if r6.status_code == 200:
        sim = r6.json()
        print(f'  Baseline burden: {sim["baseline"]["regulatory_burden"]}')
        print(f'  Simulated burden: {sim["simulated"]["regulatory_burden"]}')

    # 7. Test variant bookmark
    r7 = httpx.post(BASE + '/variants/inflammatory/var_001/bookmark', timeout=10)
    print(f'\nBookmark toggle ON: {r7.status_code} => {r7.json()}')
    r8 = httpx.post(BASE + '/variants/inflammatory/var_001/bookmark', timeout=10)
    print(f'Bookmark toggle OFF: {r8.status_code} => {r8.json()}')

except Exception as e:
    print(f"Test script failed: {e}")
