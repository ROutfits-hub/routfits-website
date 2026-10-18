const PRODUCTS = {
  suknele: { name: 'Lininė suknelė „Smėlis“', price: 4900, sizes: ['S','M','L'] },
  palaidine: { name: 'Medvilninė palaidinė „Aura“', price: 2900, sizes: ['XS','S','M','L'] },
  svarkas: { name: 'Klasikinis švarkas „Mėta“', price: 7900, sizes: ['S','M','L'] },
  kelnes: { name: 'Plačios kelnės „Diena“', price: 5900, sizes: ['S','M','L','XL'] },
  megztinis: { name: 'Minkštas megztinis „Debesis“', price: 4500, sizes: ['S','M','L'] },
  sijonas: { name: 'Midi sijonas „Rasa“', price: 3900, sizes: ['XS','S','M','L'] }
};
const EU = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];
const json = (body, status=200) => new Response(JSON.stringify(body), {status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export async function onRequestPost({request,env}) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_SECRET_KEY.startsWith('sk_test_')) return json({error:'Stripe test secret key is not configured.'},503);
  let data;
  try { data = await request.json(); } catch { return json({error:'Netinkami duomenys.'},400); }
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 30) return json({error:'Krepšelis tuščias arba per didelis.'},400);
  const params = new URLSearchParams();
  params.set('mode','payment');
  params.set('locale','lt');
  params.set('billing_address_collection','required');
  params.set('phone_number_collection[enabled]','true');
  params.set('shipping_address_collection[allowed_countries]', '');
  params.delete('shipping_address_collection[allowed_countries]');
  EU.forEach((c,i)=>params.set(`shipping_address_collection[allowed_countries][${i}]`,c));
  const origin = new URL(request.url).origin;
  params.set('success_url',origin+'/success.html?session_id={CHECKOUT_SESSION_ID}');
  params.set('cancel_url',origin+'/?cancelled=1');
  // Shipping is €0 in this demo. Configure real shipping rates before live launch.
  params.set('shipping_options[0][shipping_rate_data][type]','fixed_amount');
  params.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]','0');
  params.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]','eur');
  params.set('shipping_options[0][shipping_rate_data][display_name]','Bandomasis pristatymas (0 €)');
  for (let i=0;i<data.items.length;i++) {
    const item=data.items[i];
    const product=PRODUCTS[item?.id];
    if (!product || !product.sizes.includes(item.size) || !Number.isInteger(item.quantity) || item.quantity<1 || item.quantity>10) return json({error:'Neteisingas produktas, dydis arba kiekis.'},400);
    const prefix=`line_items[${i}]`;
    params.set(`${prefix}[price_data][currency]`,'eur');
    params.set(`${prefix}[price_data][unit_amount]`,String(product.price));
    params.set(`${prefix}[price_data][product_data][name]`,`${product.name} / ${item.size}`);
    params.set(`${prefix}[quantity]`,String(item.quantity));
  }
  let stripe;
  try { stripe=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'content-type':'application/x-www-form-urlencoded'},body:params.toString()}); }
  catch { return json({error:'Nepavyko susisiekti su mokėjimo sistema.'},502); }
  const result=await stripe.json();
  if (!stripe.ok || !result.url) return json({error:result.error?.message || 'Nepavyko sukurti mokėjimo.'},502);
  return json({url:result.url});
}
