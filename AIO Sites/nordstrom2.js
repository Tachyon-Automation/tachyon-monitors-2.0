const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '994681943939612672' //channel id
const site = 'NORDSTROM2'; //site name
const catagory = 'AIO'
const version = `Nordstrom v2.0` //Site version
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${table}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        monitor(row.sku)
    }
    console.log(`[${site}] Monitoring all SKUs!`)
}
const cookies = [
    "b;MmXHhmPvoJPcHej8ya__L9pWVj-nVjyGw5vNfPBYwhiddU0MDcFGZz7P3ntMhhNOeQ3wyR1HaB7eS_u0aHlDLfsW0hX9weRBrVgstIvxnRPmggN3bvzwhe9WLcxYFyXa6z7WvoYX4wKA_zzgXfhzj9q7IkRExjXI-UzujPh61bSWI6ppUnQdyBtobE_Fz2P7OgUwhVwAq7SnUmdG1H_LH57CGzI1k4AeL6q7KXzS-0pj1IO-9yNIi2VZpXdhErCZTfAXB8OajYCZqyndxBlj0gws1-cwTGuWiVemY5888DgHK2OYE6uq0We6N3iYqTXWVrHdbLKLkV5pjF5gVbbnNsknWsWBLP53NHQHO56ocW6cSAeznEB_5w7UXv90aBNa5MRKRzRXmQxV740N0q2IDyYchyCU7FscKKGdWIy4Nc5jElu_xNdrVnUbgjwKAEe0Tw0jLa6AkXhhoWbyPdvivfTjceq848ctw2k9za9fz6HjocT3kC54Yxj3_mgZh67i9SnTpaToNN5c55XHJ84F03xQpxjy6yZA4gEtsf0q-9-_mbm2xY5Dc2s-SDeCfCLSk3Bwxsoe3JeFx2zueEvzeNbyrreXyFI9dP0c6ns9ru2MHTECw9STfwmC0Je0p15AyK3Q8Q8dHSFnDQVK27_deK8tY_izoGCStSZFDni48jrc5lxlTvHLIlM2lnPwZUUm436oIftbU5ftE5L4PZflXjNx-NDIZthcl58vBtzmZYAnxpQn48va1oha8YE61ipm3QGIKG3mm_xuB1771E5khi-Q_6WAMGu_JrusRA57KaxKZWrdtdDlc8TNhf-E_lEKnsA3OmWJxnTN2WQ=;-XMEQOD1miQ0BNwf3X8_lhmpg82FWNWDxSIvFwxxxQM=",
    "b;e3fvVoUfSi8je0q0QpVAdot1KS7_Kl8zsXBnP9pr2-2UDKY54fz0-iD9cIWdrChEOn5fg-9MGPyS6H4UxV0YZVcVa2d5HS5WAXHnqZCOiJC-ryFySMp5uIdmmY4Y0CFveNvZs7TsuwTAIQHH87SWQgaSB0c8V_xQHnZjzsFe8jZNqW0sRjfVSgb1ehHiE19mlsa_4Cfu351ZluTXHwdyy0lLE4wF6fDyjLPFi4NrQF7_2SwP_fF_RLGjRZc9OWox4GnXZbOzwV2RMQ2dOUWvlYgAjrjM3IUq-F2SaqWjhgR1xzqRQwbpHaykGU9fs_xRuD-_cR41YhZerGrq82t-n-DgpX5hAcdzNfDcvo0XYM1C3z6U0hfPSyWj95J8QyvcfI8FN034eXX460EMRQW6XqE8nWSmPjoBLnHT0rgrwQHKOEg_u16x4LFXAO6Jkbf38sDW3u8Ioo33G4QSQLWd0dAb95-n7AKDCVc3aN6BUTb_rc_CY2trUJih6AEtFLqvd5OxASfdqmW2xd8AsAhovKLsmYR6KlDduL0IqmPEw0hIe8C2o5q3K5PmNyHPeT-X-YzA-jqviZYvNhXLOsD9OBNV5h6rEGwPVvSdRG9ndXM8njX9MUqPIYhljJT-ha95A3tyd-YIPDB4S513CcWgcJLpkzE1TGhqb2lhh7EDI09ZG2l141xQxHCax3knNzo8WjkiipQm_w3wDMWdcI-iVEbONJzBhdUkNjsgf-rdnhYneYJ7XM3mscS-BfCcPm-VgXtNhJSjXEjlWOy-NyF2Il8yuniO76at_PMoO73965hofIUQFrPWtftaULw-nhh7Yb_YA6MaeJxXJjqAn3jz5g==;_AW2ZO47rPGN3lD2jTTIDTXcfMCk2tsl6_jNPIi33Ek=",
    "b;u6MSSOxB_GNntM4ufLjVtjUN9VTTlmJxuOZsSjWhTxTDLQ8Tq064DxGxIzkvs16VmqB7qY03bGXIUTTeQwCRkVLDPtQSrh1mPGe7g4WabSutEAxMMM48KkbCLs0V36h1iqPpKvKfepIJZQzHYyuqDAyzJ_VKkXcBhXtX-H0Yw9V-oBrL8TfMNjzVK-Gme2gNEbwqVsxKTT8wuV3rvGKTRLC6yvQmGHAhdJ4jKH6wa-sSVtSJsRH6ALafHramcc_1aIOBxmHy9a8EXGn21MgsdRgdXGwMyZQUTb8qzEGHYOED0qjhy4y80O9Lq4_Mp0-4hgopRVHwKqlbATiY8WqFHBso2w_JMD5OEEKBNFwmpWrovqXds__5uwzXLdZ5RWbFkhvUuY0eXV0ugl5djsGG83V9plRSl4QaB8xLsAoDDLEuu2VcDb_z-Rc7p6CsoarFdC4ws5Ch8MIDj_eKNa0Ap5kvOpO9ZrNFVIjmFdS6fXJiwPdkjLA2F-I_sOwZ7PKf6RjIqD7WZtNryBhM-lSNL3t--62FbLq4_NFU6xYxow3Xzxykv58I6HKtU6qGcz6kTOjWtNmTL0-CEcsul0VOVcHoEIGTvB5BYr2rfZ25yrg_TXXYxz4zO9maK1Tp01FeZi760G8HcXccWCZ_nWiktmNMbMvLMTLYoGzYvl5Z2_NiOb10Xe-20PZhEz0o0HPqnFnDSnwDDjj4shciDtH17aLAs1CtnBsuponnxJGoPmJkE2Y_vSvZZA8wOgQGBvaN8cJWNr7tcNuE_NblI7f5tOZckoMzKzX9Zrm22q3-RKgybM7PfGhF6y4HKcC_7ibvhQqHOn3EOcxZkA==;mt4kDoQ6Xmf4JSGWjajJRPWq7i53EDMDLjCrIibDvtc=",
    "b;AQg7IkMJrPxIIUsSHJfM93l8YdypB2VZ9ojGeY41Xbxw_AsKCUON_59Tfe_UqCtmeZF8kNzdTF6xhJAfs3waW37DqUzluhyv_swkz2kav1dB4NdQtwdRhAqcL-y2zjCYfivoCdFVJM4BFUXE0I5NYnN-dyA-WW8VgTbizs-ZMi-xK11qavdQ3SifVHLBNQF3fdn0ZmnD2lOkMbNPjZpbYZrepX2Yy5Nf3R4ftTH8x8gih-iM8txZCKiccP85BEVMaLTBEOlbP95OM0950hzHNbew51b-oAyXk5E0hpWL6X6cKkyMUfGSIpx3PPuboSdxohbGUNFTD_fVrtF0ht4ZyK9G-q5LlFowkraZiB2U_YZTNt38swg_ng8QFauuTG6IqsSI5oz1lWHQg10rtDQFywLdj2v6tLIaEdK5IgTuV7nVF8WLqqiaUVCH3hL8jhhfYpCvMplrV0K6kIZu5PCSh3BdH7kPWJvFS2Yz9q5PeB1h2RFBZTBFRWT94o3sInjBpf-7xwp_FuuutoKEq7rXBceDEx_cczVtBApcfZoL0a-0rPt4_mpa6mRcdffyupaR-Gr5cNttkxtc6Z4j--DOJiLCN5qzvFQ-nmbHk1eth1iqJes9vhpH13kggtqYuGE464lll__2ox3lA9lYRQTuwoHFNS_mQfPbt81p_p_o3rFA3P-Ke3dBiDsd1TtYw1dORCPu8e2k_YAkhiQ2rgcm81224vKVbe1qSzfXo_o9lG-HiCTtQorCf5hckqK27v4-fG3s_NqxwTKeELi8bFKyxz7Qfbui7SmLO8LyBXofEH_R7wpa8Alz7YsCj3mmpRm1mxpDt2TBITEKvAcWEvGuQA==;ZeSX99ctXu8HHddFwidvLEzy3jU_o_NAwKCof5alNtM=",
    "b;yXqx60z9wZHkpn0NpVut_WyAPoTe9dpEf9wQUkOt0CR-2FtYhlI_V28v-SJzwBrzMPIhxLh8cltqXONdIIRxaEyJQXgCb9F8yXmKe6h6IH4MOvi0_TTXNrDJL9XkTneU3RSlqpMMOBTnoEAvwM5EDotcj22eG02Lgw60PpRQFBsSkEDNNpkftWzCNH4P26UpHkyHdqLhL4waF4BftVOJrVfysAlncSLEtYzEiePxx7Pi-KskVAy9UTRUg4XvE8cNnyCu-I1a07QO-dVeAtP8-SAxSZQaM6eNFuFLrEb3iJg2cJcrtZu0KxkiZSMF2xPDjLdFf-ycn0nagF4lOe7cnFgUxTS0fYx6aav5hf-6s62TbAKckPtoLvkpXpZobCF3hhqjAzZoNkrnieabOBMXMZ19VeeOWzcOZDIAksZZAAiqWy5wnY_5nKhh0xK-v0Y2YZWqLMylASdqLjDSm5E4D57Baz0mmrTkNx-5zFI9R0nMJngBGuxr80SX2TMVqQaMRl9ayF1LolLkdBcLTO6_ZcR0Ef-b8aLcEy-p6v_O8FeG2lgkH869tWjDvyHaD48X6MypgrgH547gD4japKNEN4kJ5lvuJ6BKqALjgwi8PhFwHq_bEwTbXJtaRPNKYq362YPbo61OUjJxB59pM8Q9LF6MFl44IWp5vF0U--SXLxAd4rS7rkwA6FuVZVGOh-NUqQ3PktdNM3SSr6iJrizTXESgG1SXL9eib3MTkpX648yQkO8iLWEgdSo-pkYjLTK4aJyqlu2KcxU4gVHbsD4EAdh1heN9T_O99cgDx0nMha1SJm_z-T-TVg9Y7SsoO9Wehl2lixjuB4bZ2omSRA==;gKuQp46wZ6ltHTmhFhvQ2Nam6HtTWLPswH4qXGxvgOk=",
    "b;ZNQAJVNKxscsFzkEK3PItCf90O0giQ1lcCaT0km4B7UGgMZo0dfXInptvkR-pctHQYw31wyTcRLSmvXm7boayKkgWcA9PoyjeU7RFmPRSrCmmE9t35QzTqUMI0kJpT80ahhhzU1GijJLVJ3Zcy5YT923dUBt2Oi5g62PLhkCfzJvui-TDHCtXgKq9PrJ7uwaF0fOgSMEGb3bt1MHgJAC4RhUaEsb4sYfbBZDz3DqIVMxtkHC18rqmIjP5G4T9rFIYsfYutNCbcSLvaSNmYV0emB6zMyBcfCm1OJPPbxOwkVnYExhVIl7JL0QgWEMwsT9YwfoBkAZQcPGdprpl65LIFNkTkBCISYLboOxhWDF09-Sq8x3KbiF0BgjMELZY2AvBBLpq_3zBG6jSOek2GfwLOrXoJXAmVmneuiDTRKm1MocSaRarVRQ51RLotxnpvKhhgQLK-iea5A0mrwQyxDDaavezM5ykSQKHM0slvwzRoRepqFklwuiOmmE0S0Gf3wDGH5ufvdFdjn9O3POT5yc36LRpJ6xKWhdLS2OLm8zZLRRhVIzuY8DOcupHqVPPgBYN6R5pPT29GNdMXZs7xTKOxPQXBUWQ1Uoq3nxNsoTnDBjOl0QrEvIL4zUYklNgYlJrJuCNmvUdCUjbrIyRIE8GF4sWuXYFgr3bP2sYGBKroU2Ym0881RXpqrS_2VC7GMjVTRKlpSx15Dwf_BaS6xLsjQ65l67302un-lmjvOV8s5ONWvEKAcXLbTmTxGixBaOSNNGsf4sW5IadhViiRw2U5JvLpnnvsyfeND2S6q85YNzxGtM6oPzA15aVNST4GTH-BSy9WMRfvhMelisjQ4=;_JR1wAJQl5HCAIO7zTBR7-NVVD3GGgCqUzlPbZdKDIM=",
    "b;93UvyelknzuRe147phTmMH2hLQIoeF8kicBNvgtO-RcEzq6xEhT050H2rcQPJ34e0vgPWQq3A0QdFHwxANaVsZerhqFB24Huzf2bpE4ZSscOhwzyHblIdjk0iJv92d45AbfXAL1-WLKF4UxQutz2OBYnJaLoh7yKy-U9xalQLbXVLebGafcSfOK2It9qQvzHBJhQeVak_6ITaxX9G8VneQA01q85OP0iJ32-1H3PojTkn20DiuH4fHZ4o4cdO9cOlKLcWXJK8HkJ31x2m7XFEysxlu5OIIiw2Ze2yLcCoqAVO0YtUtoFJhZbYSVp1d34wZXzeMiv2XCeQ9AISzOTbMREUA2-v5tqD97vuUSuiIVhxV2umNVkgoaTpUwzBPVq_LrkkHgZPMMWc2LiGPJ7ss11ur9nFCR3DtYHQCRwgnwvchcVsqMAprGlqfjOocPvG3fCbT_d6mDJV37iz5OD7tW6HQKFiCPc9vYbrYYPIvDhi3ArkHOxrB_yycOLu_TwVcz_UaVRkGSxB7vmYjiJs4nc6oz08fKK-0fPwPKvZ_3r6LsoTSMctm7Ub8jOLnJq7_TK4DDXZxlliwNAE1xyKl2ycCGBZFvwJmJbVVeyRP-A83NAP09NNu8rHQgJDj0os2BgRaDPTKqks9XrUPtqTpj7VKEjtyGEXIPazpF0xq8RkMdjjedyJpLbgZ9V390uXnZTZjpKh9KhxSDfzFwGhdvBIvr_boxu6zsaudEUigoYA0yH6IZx9qsovP_2iza_xP3vqOmK3X4_4GJk8uUTv2iwlcegMAMRXmuMxAZlabs_toHbdpuEYmYB1Phi_bekBLPw5hDmMQjFAXQVXA==;QqnHjnktHH6TdMUwHd5XC-Yml4g-Gyb6LoIWMzK3jKI=",
    "b;k5Ak0-8GgW3D1WKlfwIHWA2K7tgIJYviJ90h9f6LrVKCZWvc5tg1e22sReGjcEhcoNnCtWYlYc-41gkZQ9_sOm6A5YtAv15X8U6KggKzIN5BY1VEbNWYs0g2BKfKQqjbKZw8E6e_YqCJccKNvWdwx6DVRmApgy4vmh20sQkmgWTGNTM1UmsqtCJ10R5lSojw2kb0ZLZs7pmrblzrcnFURW-f2OdAaKku8-IAUwO6be3ASVTSZUHh0E8nli11uA5q2j-1-cMWuPxj-Wy7D7c0Mg-XEq1dh0rdNFkrdoQqoZj58VhJA2KT2BZojC43K8fBD2ZoChHMeex8AD53QuYjjVNOsov_v2oN3v2hc3c7EoD3UWAmXDGZnTPWYv8SDs_CqA0bdTfpI4WvmJ1d0tTkvzpAVI8tvks9S4pQC1x4buYkj5cZ-NRlYAE6IsSpaBaLKa8e4DiOBhTXi0R6MsnCPvJjX3B8BecYKKq5LYm_fjx0AdLCtr2oEhLM4eH4atjwCtTJL4z3Ky-2RF61vrHP3vyY-flc7Hr5ilakFplCr1JxwUIDQK0gOFIlkERpUAYrCL-y1yi93UfZpLu5YQczsyckFvdNZSZCZSEMyMwWhrdOJIsw322GNzglTjXRzJNEybgZarLDOmsAVrUfyGK-uyLJUUoOL6TogandI3kfnfTUYC--klOnH9p_2GVOLj_lm6BYabVwDy8fMFm0HHAuZB_yrNYgs18GfZZaTDEWmIbzvcp6xl3Vj-7LpXMpC6qEzQU6jzvXO8vzVFf83WDjkqx113Bnb7BiT9gl8Kx3LpgD0eTciDazOuPoI0EujI2Z9lfaB7MUqM3vlU2Q;mLnbJR7fN3sog44IU0Q89CqCg5KmnoLbvjY92ohOd6k=",
    "b;_dcdS7czSYGg1QDDjB_bzCB2tjkEFUmIuTquIIhFGbi3Po6WmkZz03Ma1VPZAZ5JEVswZAl33JqvS0QFYagIRNksV-CaWlqbV7M8tkDB_cj2gkZYBW0UwSYhINGAOYfs1QDjO_iRTOhLmmJlbHL0VLYK2xwif03TNExKbfCapNXWkc_l3GslIfjjIIBfIwggcbkWZLrsveK3Yf53LZ1cwf55HIgRffkaLkiD_j_UMIsnr7tNNgE2Y4rN0AfXiE2EqvwEqRrEz3RbmJR3oxEBCUqZ1c_56SXvsFWu_NSbKVYihQfHYOrxG9u-OvfrEWmSNJ7oRZchyNzeNMlXsaLzT6MCccYe2l7MO0vdJJSuWvRG9ZEDC_KjruJ1Ur4DMN0S5ogU5LmXTXFIidyYD73XNO4P6LfYoOZz0YGoRMqQZ5AzDOoJOvV48SCl5GggoZtKECGGh8fnviRM4vyRqMiR-jIHXBryYEBmcIBRzkZwy7bQjBLMvDXiQLUj-xSFx-n0CNMBIgkk0CMzLgDaoTY5OFnircLLHmFapG7YyubCIVd-hZnddzD-zN8lywAjcZlsQKHBapf4e4sB55BXLHuYu2R8faVzzzEfzg_d8pNMqQ29yQs6Fr8akmMM0B8TfoEgVheIpDFNQg8oDzKisNCyZPXFM41pKzI7VXtF4inPZK_dErNwFDX8-ut3C72Mjo0GBRpaY3xnNQf8KIU7MNunHXtaRouV9vF44K35OB1im-baTFYruxZgM8yvcG7xZXo8T0jE821Peoxv2VE9Q6bVlbTImw6NAOagUt7YnHZ7V6HIv7GItE0sCt-vgucfUy3vMjTbJWN8Ig0z36oQ;kSSA1fWlOmayBjpZ5NYX4Ta_cI2M23vMSPpELrKgO5s=",
    "b;9SZdCuaqxtVrQ12hEuJuwj-J64Q1uZMmAl_t7ZchD9vg5R91U7U2ss6LCORFmpk3OEzrA6rBlWgXHsf0-jOb9cguVmoeGHvm9tLmqQlie33p8ow4Cp18Vip3cmA0fP-Gic6q6DtE-9v3_BME-0m40kamHob0bFF5JbxJWa7r7uyqiC-TTP-W84sXBh7iRI68AVyO4IUdJDw4T1QDKUzH1f9S8MiXmaCSnsI9Qo9s0pyouzqalNwddJMDTDcSVkRhPU1lMbXkT1gh8O_A0CTga14R52fwsd-dJgAqZNXv5MTmd6gGSiJ5OxOSNkO_7UXjg99mB2-06rhvf8Zu-5fpwpeMxMZWLhKwn2wLK00b_h7tQ_LNhk7CWW7fpnj8DJit-HGA1Xv3pDJQoTQJ6Yku0iUxBNcNhouqRMQLHsx-ZBgXiX-ENnxP99cJWuVThnaEY1aXChKPKtUPTBXrrNQjNKLy5V8u-dUixhTqePqhbzUeh60WNoiGh5HrsFavZ-vKrHvhlpCNGwbJI4RHqux1aP7VjH4ZZb9sYFK5z7nSUeFCQ9XeyirnNzzqFJ7BqlniaSJL88qPnGmwnqITwYyD_d9-vWfOJ4MtvbE4uOVfnvelIfy-YzTxuOCRPrefpBKJSQ2cqNHdncrxXEtJhu6QMsL_NVBFoUIaq-JPz7Vb-P2qRJEuIdcSQ9yo3BN7aJN33D2YBZHBB-1gK_EUqFuuyS1c12QBF_AEgCzt6J8_fFRolNhv01Xvq5vKImKuq97thSJqV2sCPQuxWW81Lw-N7garoUC4ZIawaKCsum6JajpOZYRHmS43r9YF8Cx2twcngsQVMqzvGb9re_8DeDpb;vd-4hrlgrk2nMNsUzvYIKH_ljGHDNGUGNvrQHnfsZXU=",
    "b;eByeuMg_lapOopbOnFkV1FrvYn6FwMZYmjVO1jLfwdysUVlDL00YvkwGNVkdHyMmj3afI5kBrd-fQJe3VjBo1H91qUK6jBPXM4XzHzNup317hVWpyJto3Io7iahguaLxcI-xDOVt95HLv657aLFKqtCDKFLrqjbT7N6azl1IQA1IuaKEnucHABeyOnEiO5Ym_74sAxVu76Kwt8Y_ZFfvJ8ekDWPw9RJbjXY5grGyxRFR5z9rCRV9NyrWFm4FyZetOZSZ0F_K3k4-B6jLx-JeBKgwq4d6lZxIADPfXCRJONw7M4-Uqu6qXQgUWrfP44IS7AJgdR4s4IwKR7K3ocOu580PzY9zzLs0hJdsqwtOHYm8QWWre_TC07EMV1EtJ7kuo2hc-_4Mw4Co1I-nFvpcXzYIwYz3FSYY6npFmnyW4Oe52S22B7BBeapfTg2ujUXL9jAznbMxy5LNPGFzrSMDR-aC7_TQkK_454mmL4OO4b9mPfcacT25LcvsyK65Mv2K_rOaFxW8-LINiUjnM5AgtNT9wxellD726Pmlmj0adyBJD0LVY6sGRckYdvBFbkLL7xKg6WrzsIwA6SVutDIF0H01uIL28qYmN90DLClPlcc60Qrupi7EBatJc_VIJ0MhwQXXhHuCtASvPLe2ITUei5zfTtjLrqVNjN5EGFUBcPF-RwYo6b9VbmWkaYH9S-7R0hQY3ak5EbgOW7vZ1LLpy7SY5ylW-BodaJ_l_RVxyWfEKi8RiMt33rzwHFZPoHm2SPorOpYnNu1UwYZGkbPM4szQLXCR7iPMTdiJUIvWVNPSwd11-7EkEDwoLO0Woa6mHcwIg2Zgwh9y5MPUfHTOgw==;ZPtMj6gieN-4XMZiZdgOlsYx-nqkm-NQg1WIqu0gaF0=",
    "b;Kp4Kq8yHeu1eRnXbpThxrb_4tOXkLzq0sxTz8xgubqNy7YjSRNvMYwd1Z6ynYRxb4xVLRub6gflA3s4PdAP9fnxrCo28R4Z9wlYbtCzP9AaX1Be2o701Muq6P_XkvOajLqDOHm7GHPiDZ7X_vgHlFsiMqRLOyPUsaQzTi9VlVucEsJ0caQmdLhHD-pVdA1eJfyFrEkufh-Jx_YNsMGrgPjNDmhxTLwYzkuMsY8CjVTuySXhsGAQLTvb9LVzDsfPMwgm9mt3quc3t0IjF3TKiUqaolZpvfwU0qY9adVn8vjdL5pv6MAiNsdm5BhX-6giKTJaMEzM-JqjHa7cy177xTOvImYnQxThZTLHmkw-qfyxfsUX9aTos1KvsnpvEMQ8iq8cOYoGFEklKnMy2oq90S9JsIOr-LuRx4BNWpXBSGgWot1QPazLhZmQKLQIqAfctNpEU9jpubEB21MwZmmXN76xJ030-mNTz_qXLj_1jBaerP8zjoO1XZHbtOasRbRyNm6xpJvtytt9qQz7cy_5uVUu1hh1Cv51_1ZcK_gqty8SFkdL_6AZ6PSAC2RoFvTErlHX52X53kIVXwSUio2pjHI0n1YCDITIpG9Sv18eYppgf8RXvsvlPNLXIgcQQdTEvIVn5LVzhe5CyjlAsZQtvbjjUAjlrKJlrTHDYgEumilOUJnzDfhkUgINNiY__BAwVQZl_4Wjv0cSLcpBzMLOL4KWZJGayj0N4uV2v-Y3DumCsV8VUk7hD0FrCf17B2XXTM2aOdt6WN4rertVCayJ1ornBrdgJYVXcjCQo_x0oOg2RDpjZXXYt5qd-H4He4mdfW0OuL0JhVvwz-VbY;0aSyYpjYXvsS34nbhocgYz57563NEhl68IWqma8YuQs=",
    "b;UXzRYqVRSbciO0Ul1gwtw9liaNq0vO-YSUOzS3xtWr0yhj30ds305Nr_SjMTApBajd-AzTP0KzOONN6Gmsu8wqVlmLv9oL-ubpI9Rb_Ywcy52cwrjmbrcMVwwtGTMvBVkOTq3oiG9pGkTnFAAbNGk5N4uQ1xf_6YSlN5m2sJc8tyKP7uEb_rUL3mMMkYQ9JAPC_w58HphqRDAOJDCI62_ceRJd4t3J6KsQR4Jo5Qgl2IxYCi1XepFwapZFb60XdTmoSCpRBskVLEGSQubyGV5syc5qyCapE28sAOYD5sJSXqAtbC-CYkgI-_9sB96LmjQliFcHi-lfswudlzzP6htL0Yz-ii5j8sMGcnZVMnMMZf6LTQae10B6OaU7eiDjIghKh-kCzozOLCemDR77I3WmcEIAIcnjf--scgs5IaCQOEd6E9QlGH-Is2-Kxa12pFal1cPlArrWVyc6fa_b9k-XECMfhmyAlAGwbAzIUBkI5tRdZO1X8x2P1yozNT2zaW9zsDw-Y38FTIjS_Wt6-M63W40DIPBVTBVxswjGrLWGcQGicw4BRiqExX505AWMHjn8ZL83VyguGS3YlpwTdeIqtF24KWFSHTCL881JVCHFXU4bT-PTOEb7-EMBN9NHfG1uvaNvRjqedxBZh-f76E7e7xCsKU24Fc0-huaP7KRQ99MZ8Mn-rDbaXRRLxOsaLtpfNxvuo6HU1XIHomeatcnvlE-ivCxEBg9-Wkr9SrANSigJiCt_03_lLFqsP_AHlXOghuPW3uE8evRu-vYJ5P6q41ql_DuWrhpP2QqwN0mHvsVJ0yoHk-Pvn-z0Jtcip7v_GQxLl9OuCpjgLwYA==;bOz2Bt11JneacCYcdwJILK8Nbr--Q3DPewHO-8SKCoA=",
    "b;rHEjlAt5VzLJNmBN3EvaFVWAEexgp3myGJLqTS5ZWZzxOA--AHv-paSjeBZQjD1Lx1e_lEva_FDMQE9d-kqx3Sm7OCmy21iQE3f9d-2gSciTC14_1ETSf0MlSKlDsJcWrlXoZJZN3XtzKaIRG6D9eGOflOtSFxVWNgQdOy12y3kJ-EmpmfAJvVeV9k6tUEBwJHf9BAujJNS-PFht4ERnV2hDg9n6E39MTjEEGKq3BXWZoB7FEZdTIL3uLm37gvZymJSDnj2lMGmAQMg-YOrnqOTl-aStMUOjhFywcLp44K3huKzFyn5Gk-6DV-hbj1CEa59_bNeaqGtufdFnao04Cx6nSe_6RTkTlupcz44LTA7mqFf2HKCjA7enLXI4me6SrrxTwGmgJEPmcAlSg_sIRJLCQmocYr9hM5EkavbaPwWlB-TrWXs52QeqPTujM0c4vuX793WUr1kgtIOqskySy6bbKzs1lkA2ptHg2dM25BAFZ4HA5LtO4NvYcHFbQCAfHP4iGE1zBV3GkmqA-bWHSFt6OBuYnmfZ5KrZ5nw_JiYpLr3CB5VXUayaV1QZtdl7EllzQWa8fjuanFzxxt4yOs8747kjdIjL78JDVQuNV3XTmqywb1K6KdtZvHEwaoCF4kyGILiyQq2Xy4vlso8FFin3FtC0D2RON1B0rDWQmoFZLju06WQEnUBE9hAUq_UUyLeO0sq3Moef8xvLZbY5_lbULZ5SnT5eTbcXzxB__ecd_wkBqnD2GvLWdI_JMeN8bF0qLfVVOl0MUrHseOg8uvnWS2rX2qy0dexA_3viZRfhghVPVRSc1gQB7U_s5rJahLKcvDhcTIFkjL-Ayw==;aysLNJC3WQWAhpUgC79vK30PCM6QcRHZ2B7x4QbFkFQ=",
    "b;U_n1ENtRnzP9uPYRprPR8His5ucV_0D_rX9bkDASsOgkfA2QBzsW1nBZ8xAHZjP646srTDKmlcWctWOl5yvEaPpwjxEagD941HDZBWp2Hg-z0NZYGZMkqlr2vQlLYD1t5kLfrSAEt1xMtpQ-MVTkEuCyGUpupum15-5_qdDERv0SX5ImWp-NFMYx-2n77PyOoiA9OCD4JIygj4Lf0Lx9_kNYjq515tjC-u_Yr4e885VlcuLLOF6iOoP6DHJDs4y09SFYpN9l80eH5pG-lQbzPJTdKZSz13F-vDENlc8gTeriiucZjAXeEBcH4vCfBpoX5Vzqw9Qmw-H7A7-K1EC_vz4KIIeG-AVNrwhzEWhKsdPFzLIWW8lxjAolX9fBWMwGJQfsqvXcmLADRR_SBvRIGN2srNFDoTlK-R-kwKgG946-BqXlbRhgA0E00yxvdntmzRMuqWj9Qk4t9wGro_Yca4Esx-i0-FW-XNU15GHUEf13dxhvQ2XjqgQtuaQGeJmbu6TwBj4ENvje6bBD13Ax13-t8Wtbokt13wBbxwli_KZMTWxyHtRRxbW4WMTnSyOuvF-0RjrN_rVDp_x22hkMShax7f8bQXkjOH9WGom4JshAVHna3C9s_8sHUFvVMWi7WijnsYnt8b5K76AhSa7NGhj8C6NKUg80B9n5Lc4DpETH6hpvxjc5tR5ttg2_vkPke-3FrsR_dN5U79ybiyJNml7BAQ7leVL2kSm7yNtZO6pdBrtixjpH9IsMmaNIulH_0iA2t0KzZ_jbCJDq8vJWLzkud5fRKiv_ObsOhbMPlIVrxcfjmhhPLOnJgVPu39oZ9qrFtTNPq_9pUQ3GICs=;n9_i07Y1rtzW-OnaguMUsioALKTSATHLrtHuZHhUe9Y=",
    "b;v3SVtBkrPv_1fA0j50i3GHA4ZY_dNDhn1v_QEioYnWMalb3zJhmAP5KC0njljoOiSMuOPB6KsILFULgAWmy9i-OXvtaIwyxdDRNGYFGQ7-8Lc7veQMBKQFNXlQ7mdeP9h-u2u99DikWPJvftnrzlgpVtm-lPYwyjORieVeuoE14_6WDk3xvHl78GLp7_O4DghNnRSndPjRbdX_O6RTuRHFto4MBOPizuOjZngKAgZWpQD-CKbsX2VvFGpKA0ggX6kkHzffLmZhpEIs7y9Kze0f0kuayCL5WpiqO5pQag7O6MzK32FJLYavelT8XMV5ZwNdvpxu1e2xhn6ETEXMIFYiWr8o5ZAseD_Qt_gI1lAR0y0dsb1mHJ_tfPTf0qumZbMvcG6FSyaNFqhZqY-jhd7RsX4BZN0rOBBxNbuhHT9svpy9H-bk-RYOuCEI3PWDbklRpaFCkIl1Yw_gCbixsR_Jx9AzjA8wERj_JfBf1G7JKy1Q5a2pLPhCwFo5OZdkJv6qPn1h8DZqE6enL8MDc9yCVyuvI3D821qHfMVwsuNFLvPiHJkHgquayrnD40Bq8MnkIetMiFYNpFaXLmltVhBGXEdDp8-A9hqPr83OOVtkrMH5-5nd5z0WZynrRdPjJb-xdVWT0GJM6F4Kfjm-e9pzYR1xc_rA2X_v_e9FkJD1Z75HS01dOWV8pAj0pwNgIN5jmhnxLSfyFxDXJUgqEhPVjOx115gmG_kUyimUFekfr_0TH9XewgZFgnqr-CX_5yBXXmTgCPB71VHgIg8Qi3ekEESNXTBU-YHJxuMwOqQy0CL1OVDDyJeWsXlr8xBOYgJTJEw-KC90Nle4VhatM=;_QkfI2zi5dYMhOzjt9PW4EuX3JvMMTJLrR7IHKoYLZY=",
    "b;uH-2h3ZKcAopoA1-J9R7IKg2cRsRu8a0DqXCGfF7-fOpA7aswTCdyFYXK5wYAtX4NnXueAuGFLYGhtJ9jnF3vrMiq53LIfBykIBbKgeEMbbhhdP7cRNhOhinPvxpsomxE1FeVX9JdVez5dpyNEDdOcZTQIF_f_wy2FwwHjzjn1PRFcSYR_HP3e92AlCTyYUAaP3GYbw4oB5Y_RfcOROryvPf7K1njJmAgVMUEeURErPKVPyvJ23zY3t-oeUw1w4nlnz09j1hd-MDkQ6oGYe1R3AaqO_BLGcJ6VBdQEUqS46RNYRQMAowFBsxbSNhpgJI7BySibbw_XDn6MffCG3YaVU5dQwKRgTMCltTzEQVa4qnqD5zwJXtKp_hAY2O7dNjYAmnWbOsvjVYgKm0vibRzU8SgmjTB4CGkcU0sUzqnneTttJAFnO8pxlcxQ2AE5-XNeQ8IpFmRTp5LahU_l-Jch8MV_xZ0a2xjeMEZ8ESrVVicvKQ7qeY9D7BhshlP9Xs-jlBunHJRDYhYrrQ5vLJg4rNKXy_b8HjZ_p9lIsfRp_qiLBHb45qcHGiYW_hfTgZinqxSZ_m7_X1nZHljZ_alNa40CF1zpd_41iEfWBaKpioYjbNSb7NCeG1xpJ55O_8UKZU_dO_I3gInVJBo0LUxOCTwdhFs9nss6hYLK3FOuMdG2g8huHJe2gWwnopmS7OJ12Mdwf1mdWTwVjjKsK1InLpaDeyEiK2UuNNyxR9432DF-TgMpeFne064ePuAUIS_wQdDMzBcxYO9LVSQsh9_d2Q-s8NDMRFnpFoMdSticNUBzdeX8rwmHjV6mqkeVl9TMMttVyOGQLeTigaT1Y=;9CNy2JwcPJvNUcBtP0k2MQX5XEjavxZyHygNy_0W4Sc=",
]
async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
        let proxy = await helper.getRandomProxy(); //proxy per site
        let cookie = cookies[Math.floor(Math.random() * cookies.length)];
        //these headers change per site
        let headers = {
            'user-agent': 'device=iPhone14,2;deviceType=iPhone;os=iOS;osVersion=16.0;appVersion=9.11;carrier=None;appName=fla-ios',
            'Accept': ' application/vnd.offer.v1+json',
            'Nord-Client-Id': 'APP01031',
            'X-a8S6k1NS-E': cookie,
        }

        let method = 'GET'; //request method
        let req = `https://api.nordstrom.com/offer/${sku}?apikey=kHeUEacPjrHY8SZXnLC8qGYSPXK0XJX5`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        if (body.errorcode == 'ERROR_STYLE_NOT_FOUND') {
            //console.log('[NORDSTROM] ' + sku + ' not found!')
            return
        }
        //Define body variables
        if (!body.sellingControls[0].availability.quantity > 0) {
            await helper.sleep(1000)
            monitor(sku)
            return
        }
        let inStock = false;
        let url = `https://www.nordstrom.com/s/${sku}#Tachyon`//product url
        let title = body.productAttributes.name
        let price = '' //price set
        let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
        try { image = body.mediaExperiences.carouselsByColor[0].orderedShots[0].url }catch (e) { }
        let stock = 0
        let sizes = []
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        let oldSizeList = await query.rows[0].sizes
        let sizeList = []
        let ids = body.skus
        for (let id of ids) {
            if (id.sellingControls[0].availability.quantity > 0) {
                sizeList.push(id.ids.rmsSku.id);
                if (!oldSizeList.includes(id.ids.rmsSku.id)) {
                    inStock = true;
                    sizes += `${id.productAttributes.size.name} (${id.sellingControls[0].availability.quantity}) - ${id.ids.rmsSku.id}\n`
                    stock += Number(id.sellingControls[0].availability.quantity)
                    price = '$' + id.sellingControls[0].price.regular.price.units
                }
            }
        }
        if (inStock) {
            let AIO = await helper.dbconnect("AIOFILTEREDUS")
            let sites = await helper.dbconnect(catagory+"NORDSTROM")
            let qt = 'Na'
            let links = 'Na'
            title = title.split(',')[0]
            helper.posElephentNord(sizes, sku, title, price, image)
            helper.posElephentOrca(sizes, sku, title, price, image)
            console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
            inStock = false;
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            for (let group of sites) {
                helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
            }
            for (let group of AIO) {
                helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
            }
            await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        }
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)