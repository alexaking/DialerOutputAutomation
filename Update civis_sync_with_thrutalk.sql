--This is for syncing with VAN and Thrutalk via Civis
-- Not fully tested
-- To 'raw REF' sheet
with vols as (select  
	myc.myc_van_id,
	emails.email, 
  COALESCE(ar.fo_name, zip_myc.fo_name, 'Region 00 - Out of State') as turf,
  CASE WHEN turf ILIKE '%00%' 
	THEN 'heather.ward@2020victory.com'
  	ELSE coalesce(dir.email, dir2.email) 
    END as organizer_email
from my_state_coordinated_van_raw.person_records_myc myc
join my_state_coordinated_van_raw.contacts_emails_myc emails
	on emails.myc_van_id = myc.myc_van_id
left join my_state_van.activity_regions ar 
	on ar.myc_van_id =myc.myc_van_id
left join my_state_coordinated_van_raw.contacts_addresses_myc addresses_myc 
	on myc.contacts_address_id = addresses_myc.contacts_address_id
left join my_state_van.coord20_myc_001_zip_to_org_turf zip_myc
	on zip_myc.zip = addresses_myc.zip
left join my_state_van.field_staff_directory dir 
	on dir.organizer_code=ar.fo_name
left join my_state_van.field_staff_directory dir2 -- get RFDs if there's no organizer
	on right(dir2.region_name, 2) = left(COALESCE(ar.fo_name, zip_myc.fo_name), 2) 
  and dir.email is null
  and dir2.organizer_code is null
where myc.voter_type_id >=10
and myc.myc_van_id is not null
)
select distinct c.*, vols.turf, vols.organizer_email
FROM my_state.coord_thrutalk_001_bg_callers c
JOIN vols 
	ON c.email_address = vols.email
WHERE c.date_called = (select max(date_called) from my_state.coord_thrutalk_001_bg_callers);
